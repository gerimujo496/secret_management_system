import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AccountDAL } from '../account/dal/account.dal';
import { generateKey } from '../../common/utils/secret-sharing';
import { CreateSecretSharingDto } from './dtos/create-secret-sharing.dto';
import { SecretSharingDAL } from './secret-sharing.dal';
import { SecretsDAL } from '../secrets/secrets.dal';
import { EmailService } from '../email/email.service';
import { UserDal } from '../user/user.dal';
import { MembershipDAL } from '../membership/dal/membership.dal';
import { AcceptSecretDto } from './dtos/accept-secret.dto';
import { generateSixDigitCode } from '../../common/utils/secret-sharing';
import { errorMessage } from '../../constants/error-messages';
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
    const account = await this.accountDAL.findAccount(accountId);
    if (!account) {
      throw new NotFoundException(errorMessage.NOT_FOUND('account'));
    }
    const KeyValue = generateKey(account.password);

    if (!KeyValue) {
      throw new NotFoundException(errorMessage.NOT_FOUND('key'));
    }
    return KeyValue;
  }

  async shareSecret(
    createSecretSharingDto: CreateSecretSharingDto,
    accountGiverId: number,
  ) {
    const accountGiver = await this.accountDAL.findAccount(accountGiverId);

   
    const timeNow = new Date();
    const receiverUser = await this.usersDAL.findByEmail(
      createSecretSharingDto.receiverEmail,
    );

    if (!receiverUser) {
      throw new NotFoundException(errorMessage.NOT_FOUND('reciver user'));
    }
    const receiverMembership = await this.membershipDAL.findMembershipByUserId(
      receiverUser.id,
    );
    if (!receiverMembership) {
      throw new NotFoundException(errorMessage.NOT_FOUND('membership'));
    }
    const accountReceiver = await this.accountDAL.findAccount(
      receiverMembership.accountId,
    );

    if (!accountGiver || !accountReceiver) {
      throw new NotFoundException(
        errorMessage.NOT_FOUND('account giver', 'account reciver'),
      );
    }
    const secret = await this.secretsDAL.findSecretById(
      createSecretSharingDto.secretId,
      accountGiverId,
    );
    if (!secret) {
      throw new NotFoundException(errorMessage.NOT_FOUND('secret'));
    }
    if (createSecretSharingDto.expirationTime) {
      const expirationTime = new Date(createSecretSharingDto.expirationTime);
      if (expirationTime < timeNow) {
        throw new BadRequestException(errorMessage.INVALID_TIME);
      }
    }
    const secretShare = await this.secretsSharingDAL.createSecretShare(
      createSecretSharingDto,
      accountGiverId,
    );
    try {
      await this.emailService.secretSharingEmail(
        receiverUser.email,
        secret,
        secretShare.id,
      );
    } catch {
      throw new InternalServerErrorException(
        errorMessage.INTERNAL_SERVER_ERROR,
      );
    }
    await this.sendVerificationCode(secretShare.id);
    return secretShare;
  }

  async sendVerificationCode(secretShareId: number): Promise<any> {
    const verificationCode = generateSixDigitCode();

    const secretShare = await this.secretsSharingDAL.findSecretShareById(secretShareId);

    if (!secretShare) {
      throw new NotFoundException(
        errorMessage.NOT_FOUND('secret sharing record'),
      );
    }
    const accountReceiver = await this.accountDAL.findAccount(
      secretShare.accountReceiverId,
    );

    if (!accountReceiver) {
      throw new NotFoundException(errorMessage.NOT_FOUND('account reciver'));
    }
    const receiverMembership = await this.membershipDAL.findMembershipByUserId(
      accountReceiver.id,
    );
    if (!receiverMembership) {
      throw new NotFoundException(errorMessage.NOT_FOUND('membership'));
    }
    const receiverUser = await this.usersDAL.findOneById(
      receiverMembership.userId,
    );
    if (!receiverUser) {
      throw new NotFoundException(errorMessage.NOT_FOUND('reciver user'));
    }
    const updateResult = await this.secretsSharingDAL.updateSecretSharing(
      secretShareId,
      {
        passcode: verificationCode,
      },
    );
    if (!updateResult) {
      throw new Error(errorMessage.INTERNAL_SERVER_ERROR('update', 'passcode'));
    }
    try {
      await this.emailService.sendVerificationCodeEmail(
        receiverUser.email,
        verificationCode,
      );
    } catch {
      throw new InternalServerErrorException(
        errorMessage.INTERNAL_SERVER_ERROR('send', 'verifcation code'),
      );
    }
    return { message: 'Verification code email sent successfully.' };
  }

  async acceptSecret(secretShareId: number, acceptSecretDto: AcceptSecretDto) {
    const secretShare =
      await this.secretsSharingDAL.findSecretShareById(secretShareId);
      
    if (!secretShare) {
      throw new NotFoundException(errorMessage.NOT_FOUND('shared secret'));
    }
   
    const timeNow = new Date();
    if (secretShare.expirationTime < timeNow) {
      throw new BadRequestException(errorMessage.INVALID_TIME);
    }

    const secret = await this.secretsDAL.findSecretById(
      secretShare.secretId,
      secretShare.accountGiverId,
    );
 
    if (!secret) {
      throw new NotFoundException(errorMessage.NOT_FOUND('secret'));
    }
    const giverGeneratedKey = await this.genereateKey(
      secretShare.accountGiverId,
    );
    if (!acceptSecretDto.hexKey) {
      await this.secretsSharingDAL.decrementTries(secretShareId);
      throw new BadRequestException(errorMessage.BOTH_REQUIRED);
    }
    let isKeyValid = false;
    const providedKeyBuffer = Buffer.from(acceptSecretDto.hexKey, 'hex');
    if (providedKeyBuffer.toString('hex') === giverGeneratedKey) {
      isKeyValid = true;
    }

    if (!isKeyValid || acceptSecretDto.code !== secretShare.passcode) {
      await this.secretsSharingDAL.decrementTries(secretShareId);
      throw new BadRequestException(
        errorMessage.NOT_FOUND,
      );
    }
    if (secretShare.numberOfTries <= 0) {
      throw new BadRequestException(errorMessage.INVALID_ATTEMPT);
    }
    await this.secretsSharingDAL.markAsAccepted(secretShareId);
    await this.secretsSharingDAL.addSecretToAccount(
      secretShare.accountReceiverId,
      secretShare.secretId,
    );
    await this.secretsSharingDAL.decrementTries(secretShareId);
    return { message: 'Secret successfully added to your account.' };
  }
}
