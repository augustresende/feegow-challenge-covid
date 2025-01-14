import { Request, Response } from 'express';
import { VaccineService } from '../service/vaccineService';

export class VaccineController {
  private vaccineService: VaccineService;

  constructor() {
    this.vaccineService = new VaccineService();
  }

  public getAllVaccines = async (req: Request, res: Response): Promise<void> => {
    try {
      const vaccines = await this.vaccineService.getAllVaccines();
      res.status(200).json(vaccines);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching vaccines', error });
    }
  };

  public getVaccineById = async (req: Request, res: Response): Promise<void> => {
    try {
      const vaccine = await this.vaccineService.getVaccineById(Number(req.params.id));
      if (vaccine) {
        res.status(200).json(vaccine);
      } else {
        res.status(404).json({ message: 'Vaccine not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching vaccine', error });
    }
  };

  public createVaccine = async (req: Request, res: Response): Promise<void> => {
    try {
      const newVaccine = await this.vaccineService.createVaccine(req.body);
      res.status(201).json(newVaccine);
    } catch (error) {
      res.status(500).json({ message: 'Error creating vaccine', error });
    }
  };

  public updateVaccine = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedVaccine = await this.vaccineService.updateVaccine(Number(req.params.id), req.body);
      if (updatedVaccine) {
        res.status(200).json(updatedVaccine);
      } else {
        res.status(404).json({ message: 'Vaccine not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating vaccine', error });
    }
  };

  public deleteVaccine = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedVaccine = await this.vaccineService.deleteVaccine(Number(req.params.id));
      if (deletedVaccine) {
        res.status(200).json({ message: 'Vaccine deleted successfully' });
      } else {
        res.status(404).json({ message: 'Vaccine not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error deleting vaccine', error });
    }
  };
}