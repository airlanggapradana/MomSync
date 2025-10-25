import {Router} from 'express';
import {addHealthRecord, createMother, getMotherById} from "../services/mother.service";

const motherRouter = Router();

motherRouter.get('/:motherId', getMotherById)
motherRouter.post('/', createMother)
motherRouter.post('/:id/health', addHealthRecord)

export default motherRouter;