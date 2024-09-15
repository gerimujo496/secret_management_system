import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AccountDAL } from '../account/account.dal';
import { generateKey } from '../../common/utils/secretSharing';
import { CreateSecretSharingDto } from './dtos/create-secretSharing.dto';
import { SecretSharingDAL } from './secret-sharing.dal';
import { SecretsDAL } from '../secrets/secrets.dal';
import { EmailService } from '../email/email.service';
import { UserDal } from '../user/user.dal';
import { MembershipDAL } from '../membership/membership.dal';
import { AcceptSecretDto } from './dtos/accept-secret.dto';
import {generateSixDigitCode,} from '../../common/utils/secretSharing';

@Injectable()
export class SecretSharingService {
  constructor(
    private readonly accountDAL: AccountDAL,
    private readonly secretsDAL: SecretsDAL,
    private readonly secretsSharingDAL: SecretSharingDAL,
    private readonly emailService: EmailService,
    private readonly usersDAL: UserDal,
    private readonly membershipDAL: MembershipDAL,
  ) {}

  async genereateKey(accountId: number) {
    const account = await this.accountDAL.findAccountById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const KeyValue = generateKey(account.password);

    if (!KeyValue) {
      throw new NotFoundException('Key not found for this account');
    }
    return KeyValue;
  }

  async shareSecret(
    createSecretSharingDto: CreateSecretSharingDto,
    accountGiverId: number,
  ) {
    const accountGiver = await this.accountDAL.findAccountById(accountGiverId);
    const timeNow = new Date();
    const receiverUser = await this.usersDAL.findByEmail(
      createSecretSharingDto.receiverEmail,
    );
    if (!receiverUser) {
      throw new NotFoundException('Receiver user not found.');
    }
    const receiverMembership = await this.membershipDAL.findMembershipByUserId(
      receiverUser.id,
    );
    if (!receiverMembership) {
      throw new NotFoundException(
        'Receiver user is not a member of any account.',
      );
    }
    const accountReceiver = await this.accountDAL.findAccountById(
      receiverMembership.accountId,
    );
    if (!accountReceiver) {
      throw new NotFoundException('Receiver account not found.');
    }
    if (!accountGiver || !accountReceiver) {
      throw new NotFoundException('One of the accounts not found');
    }
    const secret = await this.secretsDAL.findSecretById(
      createSecretSharingDto.secretId,
      accountGiverId,
    );
    if (!secret) {
      throw new NotFoundException(
        'Secret not found or does not belong to this account.',
      );
    }
    if (createSecretSharingDto.expirationTime) {
      const expirationTime = new Date(createSecretSharingDto.expirationTime);
      if (expirationTime < timeNow) {
        throw new BadRequestException('Expiration time cannot be in the past.');
      }
    }
    const secretShare = await this.secretsSharingDAL.createSecret(
      createSecretSharingDto,
      accountGiverId,
    );
    await this.emailService.secretSharingEmail(
      receiverUser.email,
      secret,
      secretShare.id,
    );
    await this.sendVerificationCode(secretShare.id);
    return secretShare;
  }

  async sendVerificationCode(secretShareId: number): Promise<any> {
    console.log(
      'sendVerificationCode method called with secretShareId:',
      secretShareId,
    );
    const verificationCode = generateSixDigitCode();

    const secretShare =
      await this.secretsSharingDAL.findSecretShareById(secretShareId);
    if (!secretShare) {
      throw new NotFoundException('Secret sharing record not found.');
    }
    const accountReceiver = await this.accountDAL.findAccountById(
      secretShare.accountReceiverId,
    );
    if (!accountReceiver) {
      throw new NotFoundException('Receiver account not found.');
    }
    const receiverMembership = await this.membershipDAL.findMembershipByUserId(
      accountReceiver.id,
    );
    if (!receiverMembership) {
      console.log(
        'No membership found for the receiver account with ID:',
        accountReceiver.id,
      );
      throw new NotFoundException(
        'No membership found for the receiver account.',
      );
    }
    const receiverUser = await this.usersDAL.findOneById(
      receiverMembership.userId,
    );
    if (!receiverUser) {
      throw new NotFoundException('Receiver user not found.');
    }
    try {
      const updateResult = await this.secretsSharingDAL.updateSecretSharing(
        secretShareId,
        {
          passcode: verificationCode,
        },
      );
      if (!updateResult) {
        throw new Error('Failed to update secret sharing passcode');
      }
    } catch (error) {
      console.error('Error updating secret sharing passcode:', error);
      throw new InternalServerErrorException(
        'Could not save verification code.',
      );
    }
    try {
      await this.emailService.sendVerificationCodeEmail(
        receiverUser.email,
        verificationCode,
      );
    } catch (error) {
      console.error('Error sending verification code email:', error);
      throw new InternalServerErrorException(
        'Could not send verification code email.',
      );
    }
    return { message: 'Verification code email sent successfully.' };
  }

  async acceptSecret(secretShareId: number, acceptSecretDto: AcceptSecretDto) {
    const secretShare =
      await this.secretsSharingDAL.findSecretShareById(secretShareId);
    if (!secretShare) {
      throw new NotFoundException('Shared secret not found.');
    }
    const timeNow = new Date();
    if (secretShare.expirationTime < timeNow) {
      throw new BadRequestException('The secret sharing has expired.');
    }
    if (secretShare.numberOfTries <= 0) {
      throw new BadRequestException('You have exhausted all your attempts.');
    }
    const secret = await this.secretsDAL.findSecretById(
      secretShare.secretId,
      secretShare.accountGiverId,
    );
    if (!secret) {
      throw new NotFoundException('Secret not found.');
    }
    const giverGeneratedKey = await this.genereateKey(
      secretShare.accountGiverId,
    );
    if (!acceptSecretDto.hexKey) {
      await this.secretsSharingDAL.decrementTries(secretShareId);
      throw new BadRequestException('Hex key is missing.');
    }
    let isKeyValid = false;
    try {
      const providedKeyBuffer = Buffer.from(acceptSecretDto.hexKey, 'hex');
      if (providedKeyBuffer.toString('hex') === giverGeneratedKey) {
        isKeyValid = true;
      }
    } catch (error) {}
    if (!isKeyValid || acceptSecretDto.code !== secretShare.passcode) {
      await this.secretsSharingDAL.decrementTries(secretShareId);
      throw new BadRequestException('Key or code are invalid.');
    }
    if (secretShare.numberOfTries <= 0) {
      throw new BadRequestException('You have exhausted all your attempts.');
    }
    await this.secretsSharingDAL.markAsAccepted(secretShareId);
    await this.secretsSharingDAL.addSecretToAccount(
      secretShare.accountReceiverId,
      secretShare.secretId,
    );
    return { message: 'Secret successfully added to your account.' };
  }
}
