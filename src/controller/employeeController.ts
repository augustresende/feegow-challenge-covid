import { Request, Response } from 'express';
import { EmployeeService } from '../service/employeeService';

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  public getAllEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
      const employees = await this.employeeService.getAllEmployees();
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching employees', error });
    }
  };

  public getEmployeeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const employee = await this.employeeService.getEmployeeById(req.params.id);
      if (employee) {
        res.status(200).json(employee);
      } else {
        res.status(404).json({ message: 'Employee not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching employee', error });
    }
  };

  public createEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const newEmployee = await this.employeeService.createEmployee(req.body);
      res.status(201).json(newEmployee);
    } catch (error) {
      res.status(500).json({ message: 'Error creating employee', error });
    }
  };

  public updateEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedEmployee = await this.employeeService.updateEmployee(req.params.id, req.body);
      if (updatedEmployee) {
        res.status(200).json(updatedEmployee);
      } else {
        res.status(404).json({ message: 'Employee not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating employee', error });
    }
  };

  public deleteEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedEmployee = await this.employeeService.deleteEmployee(req.params.id);
      if (deletedEmployee) {
        res.status(200).json({ message: 'Employee deleted successfully' });
      } else {
        res.status(404).json({ message: 'Employee not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error deleting employee', error });
    }
  };

  public addDoseToEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedEmployee = await this.employeeService.addDoseToEmployee(req.params.id, req.body);
      if (updatedEmployee) {
        res.status(200).json(updatedEmployee);
      } else {
        res.status(404).json({ message: 'Employee not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error adding dose to employee', error });
    }
  }

  public deleteDose = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedDose = await this.employeeService.deleteDose(req.params.id, Number(req.params.doseId));
      if (deletedDose) {
        res.status(200).json({ message: 'Dose deleted successfully' });
      } else {
        res.status(404).json({ message: 'Dose not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error deleting dose', error });
    }
  }

  public getNonVaccinatedReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const report = await this.employeeService.getNonVaccinatedReport();
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching non-vaccinated report', error });
    }
  }
}