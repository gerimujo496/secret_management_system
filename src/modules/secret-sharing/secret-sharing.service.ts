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
import { SecretDAL } from '../secrets/secret.dal';
import { EmailService } from '../email/email.service';
import { UserDal } from '../user/user.dal';
import { MembershipDAL } from '../membership/dal/membership.dal';
import { AcceptSecretDto } from './dtos/accept-secret.dto';
import { generateSixDigitCode } from '../../common/utils/secret-sharing';
import { errorMessage } from '../../constants/error-messages';
import { AuthService } from '../auth/auth.service';
@Injectable()
export class SecretSharingService {
  constructor(
    private readonly accountDAL: AccountDAL,
    private readonly secretsDAL: SecretDAL,
    private readonly secretsSharingDAL: SecretSharingDAL,
    private readonly emailService: EmailService,
    private readonly usersDAL: UserDal,
    private readonly membershipDAL: MembershipDAL,
    private readonly authService: AuthService,
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
        errorMessage.INTERNAL_SERVER_ERROR('share', 'secret'),
      );
    }
    const user = await this.authService.getUserByIdOrThrowError(
      receiverMembership.userId,
    );

    await this.sendVerificationCode(secretShare.id, user.email);

    return secretShare;
  }

  async sendVerificationCode(
    secretShareId: number,
    email: string,
  ): Promise<any> {
    const verificationCode = generateSixDigitCode();

    try {
      await this.emailService.sendVerificationCodeEmail(
        email,
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
    if (secretShare.numberOfTries <= 0) {
      throw new BadRequestException(errorMessage.INVALID_ATTEMPT);
    }

    if (!isKeyValid || acceptSecretDto.code !== secretShare.passcode) {
      await this.secretsSharingDAL.decrementTries(secretShareId);
    }

    await this.secretsSharingDAL.markAsAccepted(secretShareId);

    await this.secretsSharingDAL.addSecretToAccount(
      secretShare.accountReceiverId,
      secretShare.secretId,
    );

    return { message: 'Secret successfully added to your account.' };
  }
}
