import { Router } from 'express';
import { EmployeeController } from '../controller/employeeController';

const router = Router();
const employeeController = new EmployeeController();

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.patch('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.post('/:id/dose', employeeController.addDoseToEmployee);
router.delete('/:id/dose/:doseId', employeeController.deleteDose);
router.get('/report/non-vaccinated', employeeController.getNonVaccinatedReport);

export default router;