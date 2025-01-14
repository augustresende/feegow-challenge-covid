import { Vaccine, PrismaClient } from '@prisma/client';
import NodeCache from 'node-cache';

const prisma = new PrismaClient();
const vaccineCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

export class VaccineService {
  public async getAllVaccines() {
    const cachedVaccines = vaccineCache.get('vaccines');
    if (cachedVaccines) {
      return cachedVaccines;
    }

    const vaccines = await prisma.vaccine.findMany({
      include: {
        doses: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    vaccineCache.set('vaccines', vaccines);
    return vaccines;
  }

  public async getVaccineById(id: number) {
    return prisma.vaccine.findUnique({
      where: { id },
      include: {
        doses: true
      }
    });
  }

  public async createVaccine(data: Vaccine) {
    const newVaccine = await prisma.vaccine.create({ data });
    vaccineCache.del('vaccines'); // Invalidate cache
    return newVaccine;
  }

  public async updateVaccine(id: number, data: Partial<Vaccine>) {
    const updatedVaccine = await prisma.vaccine.update({ where: { id }, data });
    vaccineCache.del('vaccines'); // Invalidate cache
    return updatedVaccine;
  }

  public async deleteVaccine(id: number) {
    const deletedVaccine = await prisma.vaccine.delete({ where: { id } });
    vaccineCache.del('vaccines'); // Invalidate cache
    return deletedVaccine;
  }
}