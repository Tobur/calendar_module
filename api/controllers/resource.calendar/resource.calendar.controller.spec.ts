import { Test, TestingModule } from '@nestjs/testing';
import { ResourceCalendarController } from './resource.calendar.controller';

describe('ResourceCalendar Controller', () => {
    let controller: ResourceCalendarController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ResourceCalendarController],
        }).compile();

        controller = module.get<ResourceCalendarController>(
            ResourceCalendarController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
