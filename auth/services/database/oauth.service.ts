import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth } from 'src/auth/entities/oauth.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

@Injectable()
export class OAuthService extends TypeOrmCrudService<OAuth> {
    /**
     * @param {Repository} oauthRepository
     */
    constructor(
        @InjectRepository(OAuth)
        private oauthRepository: Repository<OAuth>,
    ) {
        super(oauthRepository);
    }

    /**
     * @returns {OAuth[]}
     */
    findAll(): Promise<OAuth[]> {
        return this.oauthRepository.find();
    }

    findOneByExternalUserId(externalId: string): Promise<OAuth> {
        return this.oauthRepository.findOne({ externalUserId: externalId });
    }

    async remove(id: string): Promise<void> {
        await this.oauthRepository.delete(id);
    }

    async save(oauth: OAuth): Promise<OAuth> {
        return this.oauthRepository.save(oauth);
    }

    findExpired(): Promise<OAuth[]> {
        return this.oauthRepository
            .createQueryBuilder('q')
            .where('q.expiredAt < NOW()')
            .orWhere('q.expiredAt is NULL')
            .getMany();
    }
}
