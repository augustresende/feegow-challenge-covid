import { Employee, Dose, PrismaClient } from '@prisma/client';
import cpf from 'gerador-validador-cpf';

const prisma = new PrismaClient();

export class EmployeeService {
  public async getAllEmployees() {
    const employees = await prisma.employee.findMany({
      include: {
        doses: {
          include: {
            vaccine: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return employees.map(emp => ({
      ...emp,
      document: this.anonymizeCPF(emp.document),
    }));
  }

  public async getEmployeeById(id: string) {
    const employee = await prisma.employee.findFirst({
      where: { OR: [{ document: id }, { uuid: id }] },
      include: {
        doses: {
          include: {
            vaccine: true
          }
        }
      }
    });

    if (employee) {
      return {
        ...employee,
        document: this.anonymizeCPF(employee.document)
      };
    }

    return null;
  }

  public async createEmployee(data: Employee) {
    if (!cpf.validate(data.document)) {
      throw new Error('Invalid document');
    }
    data.birthDate = new Date(new Date(data.birthDate).getTime() + 6 * 60 * 60 * 1000);
    const newEmployee = await prisma.employee.create({ data });
    return {
      ...newEmployee,
      document: this.anonymizeCPF(newEmployee.document)
    };
  }

  public async updateEmployee(id: string, data: Partial<Employee>) {
    if (data.document) {
      throw new Error('Cannot update document');
    }
    if (data.birthDate) data.birthDate = new Date(new Date(data.birthDate).getTime() + 6 * 60 * 60 * 1000);
    const employee = await prisma.employee.findFirstOrThrow({ where: { OR: [{ document: id }, { uuid: id }] } });
    const updatedEmployee = await prisma.employee.update({ where: { document: employee.document }, data });
    return {
      ...updatedEmployee,
      document: this.anonymizeCPF(updatedEmployee.document)
    };
  }

  public async deleteEmployee(id: string) {
    const employee = await prisma.employee.findFirstOrThrow({ where: { OR: [{ document: id }, { uuid: id }] } });
    const deletedEmployee = await prisma.employee.delete({ where: { document: employee.document } });
    return {
      ...deletedEmployee,
      document: this.anonymizeCPF(deletedEmployee.document)
    };
  }

  public async addDoseToEmployee(id: string, data: { dateAdministered: Date, vaccineId: number, batch: string, expirationDate: Date }) {
    data.dateAdministered = new Date(new Date(data.dateAdministered).getTime() + 6 * 60 * 60 * 1000);
    data.expirationDate = new Date(new Date(data.expirationDate).getTime() + 6 * 60 * 60 * 1000);
    const employee = await prisma.employee.findFirstOrThrow({ where: { OR: [{ document: id }, { uuid: id }] } });
    const updatedEmployee = await prisma.employee.update({
      where: { document: employee.document },
      data: {
        doses: {
          create: data
        }
      },
      include: {
        doses: true,
      }
    });

    return {
      ...updatedEmployee,
      document: this.anonymizeCPF(updatedEmployee.document)
    };
  }

  public async getEmployeeDoses(id: string) {
    const employee = await prisma.employee.findFirst({
      where: { OR: [{ document: id }, { uuid: id }] },
      include: {
        doses: {
          include: {
            vaccine: true
          }
        }
      }
    });

    if (employee) {
      return {
        ...employee,
        document: this.anonymizeCPF(employee.document)
      };
    }

    return null;
  }

  public async deleteDose(id: string, doseId: number) {
    const employee = await prisma.employee.findFirstOrThrow({ where: { OR: [{ document: id }, { uuid: id }] } });
    const deletedDose = await prisma.dose.delete({
      where: { id: doseId, employeeId: employee.document }
    });

    return {
      ...deletedDose,
      employeeId: this.anonymizeCPF(deletedDose.employeeId)
    };
  }

  public async getNonVaccinatedReport() {
    const employees = await prisma.employee.findMany({
      where: {
        doses: {
          none: {}
        }
      },
      select: {
        document: true,
        fullName: true
      }
    });

    return employees.map(emp => ({
      document: this.anonymizeCPF(emp.document),
      fullName: emp.fullName
    }));
  }

  private anonymizeCPF(cpf: string): string {
    return cpf.length >= 5 ? `${cpf.slice(0, 3)}.xxx.xxx-${cpf.slice(-2)}` : cpf;
  }
}
