<script lang="ts">
  import { onMount } from "svelte";

  const EMPLOYEES_URL = "http://localhost:3000/employees";
  const VACCINE_URL = "http://localhost:3000/vaccines";
  const REPORT_URL = "http://localhost:3000/employees/report/non-vaccinated";

  let employees: Employee[] = [];
  let vaccines: Vaccine[] = [];
  let nonVaccinatedReport: { document: string; fullName: string }[] = [];
  let loading = false;
  let errorMsg: string | null = null;

  // Form for creating a new employee
  let newDocument = "";
  let newFullName = "";
  let newBirthDate = "";
  let newHasComorbidity = "false";

  // Form for creating a new vaccine
  let newVaccineName = "";

  // Editing
  let showEditModal = false;
  let editDocument = "";
  let editId = "";
  let editFullName = "";
  let editBirthDate = "";
  let editHasComorbidity = "false";

  // Doses
  let showDosesModal = false;
  let doseEmployeeId = "";
  let newDoseDateAdministered = "";
  let newDoseVaccineId = "";
  let newDoseBatch = "";
  let newDoseExpirationDate = "";

  // We'll store the doses of the currently opened employee here
  let currentDoses: Dose[] = [];

  interface Employee {
    uuid: string;
    document: string;
    fullName: string;
    birthDate: string; // as ISO string
    hasComorbidity: boolean;
    doses?: Dose[];
  }

  interface Dose {
    id: number;
    dateAdministered: string; // ISO
    vaccineId: number;
    batch: string;
    expirationDate: string;
    vaccine?: Vaccine;
  }

  interface Vaccine {
    id: number;
    name: string;
  }

  onMount(async () => {
    await loadEmployees();
    await loadVaccines();
  });

  async function loadEmployees() {
    try {
      loading = true;
      const res = await fetch(EMPLOYEES_URL);
      if (!res.ok) throw new Error("Failed fetching employees");
      employees = await res.json();
    } catch (err) {
      errorMsg = String(err);
    } finally {
      loading = false;
    }
  }

  async function loadVaccines() {
    try {
      const res = await fetch(VACCINE_URL);
      if (!res.ok) throw new Error("Failed fetching vaccines");
      vaccines = await res.json();
    } catch (err) {
      errorMsg = String(err);
    }
  }

  async function createEmployee() {
    try {
      const body = {
        document: newDocument.trim(),
        fullName: newFullName.trim(),
        birthDate: newBirthDate,
        hasComorbidity: newHasComorbidity === "true",
      };
      const res = await fetch(EMPLOYEES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed creating employee");
      // Reset form
      newDocument = "";
      newFullName = "";
      newBirthDate = "";
      newHasComorbidity = "false";
      // Reload
      await loadEmployees();
    } catch (err) {
      errorMsg = String(err);
    }
  }

  async function createVaccine() {
    try {
      const body = { name: newVaccineName.trim() };
      const res = await fetch(VACCINE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed creating vaccine");
      // Reset form
      newVaccineName = "";
      // Reload vaccines
      await loadVaccines();
    } catch (err) {
      errorMsg = String(err);
    }
  }

  function openEdit(employee: Employee) {
    showEditModal = true;
    editDocument = employee.document;
    editId = employee.uuid;
    editFullName = employee.fullName;
    // Convert to yyyy-MM-dd for <input type="date">
    editBirthDate = toInputDate(employee.birthDate);
    editHasComorbidity = employee.hasComorbidity ? "true" : "false";
  }

  async function saveEdit() {
    try {
      const body = {
        fullName: editFullName.trim(),
        birthDate: editBirthDate,
        hasComorbidity: editHasComorbidity === "true",
      };
      const res = await fetch(`${EMPLOYEES_URL}/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed updating employee");
      showEditModal = false;
      await loadEmployees();
    } catch (err) {
      errorMsg = String(err);
    }
  }

  async function removeEmployee(uuid: string) {
    if (!confirm("Tem certeza que deseja excluir este colaborador?")) return;
    try {
      const res = await fetch(`${EMPLOYEES_URL}/${uuid}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed deleting employee");
      await loadEmployees();
    } catch (err) {
      errorMsg = String(err);
    }
  }

  function openDoses(employee: Employee) {
    showDosesModal = true;
    doseEmployeeId = employee.uuid;
    currentDoses = employee.doses || [];
    // Reset dose form
    newDoseDateAdministered = "";
    newDoseVaccineId = "";
    newDoseBatch = "";
    newDoseExpirationDate = "";
  }

  async function addDose() {
    if (!doseEmployeeId) return;
    try {
      const body = {
        dateAdministered: newDoseDateAdministered,
        vaccineId: Number(newDoseVaccineId),
        batch: newDoseBatch.trim(),
        expirationDate: newDoseExpirationDate,
      };
      const res = await fetch(`${EMPLOYEES_URL}/${doseEmployeeId}/dose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed adding dose");
      // Reload employees to refresh the table
      await loadEmployees();
      // Also refresh local "currentDoses"
      const updatedEmp = employees.find((e) => e.document === doseEmployeeId);
      currentDoses = updatedEmp ? updatedEmp.doses || [] : [];
      // Clear form
      newDoseDateAdministered = "";
      newDoseVaccineId = "";
      newDoseBatch = "";
      newDoseExpirationDate = "";
    } catch (err) {
      errorMsg = String(err);
    }
  }

  async function removeDose(doseId: number) {
    if (!doseEmployeeId) return;
    if (!confirm("Deseja excluir esta dose?")) return;
    try {
      const res = await fetch(`${EMPLOYEES_URL}/${doseEmployeeId}/dose/${doseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed removing dose");
      // Reload employees
      await loadEmployees();
      const updatedEmp = employees.find((e) => e.uuid === doseEmployeeId);
      currentDoses = updatedEmp ? updatedEmp.doses || [] : [];
    } catch (err) {
      errorMsg = String(err);
    }
  }

  async function fetchNonVaccinatedReport() {
    try {
      const res = await fetch(REPORT_URL);
      if (!res.ok) throw new Error("Failed fetching non-vaccinated report");
      nonVaccinatedReport = await res.json();
    } catch (err) {
      errorMsg = String(err);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR");
  }

  // Convert "2023-01-23T00:00:00.000Z" to "2023-01-23" for input date
  function toInputDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }
</script>

<div class="max-w-5xl mx-auto p-6 space-y-6">
  {#if errorMsg}
    <div class="bg-red-100 text-red-800 p-3 rounded mb-2">
      {errorMsg}
      <button class="ml-2 text-sm underline" on:click={() => (errorMsg = null)}
        >x</button
      >
    </div>
  {/if}

  {#if loading}
    <p class="text-center text-gray-600">Carregando...</p>
  {/if}

  <div class="bg-white p-4 rounded shadow-md">
    <h2 class="text-xl font-bold mb-4">Novo Colaborador</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="newDocument" class="block text-sm mb-1">CPF</label>
        <input
          id="newDocument"
          class="w-full border rounded px-2 py-1"
          bind:value={newDocument}
          placeholder="Ex: 12345678900"
        />
      </div>
      <div>
        <label for="newFullName" class="block text-sm mb-1">Nome Completo</label
        >
        <input
          id="newFullName"
          class="w-full border rounded px-2 py-1"
          bind:value={newFullName}
          placeholder="Ex: João da Silva"
        />
      </div>
      <div>
        <label for="newBirthDate" class="block text-sm mb-1"
          >Data de Nascimento</label
        >
        <input
          id="newBirthDate"
          class="w-full border rounded px-2 py-1"
          type="date"
          bind:value={newBirthDate}
        />
      </div>
      <div>
        <label for="newHasComorbidity" class="block text-sm mb-1"
          >Comorbidade?</label
        >
        <select
          id="newHasComorbidity"
          class="w-full border rounded px-2 py-1"
          bind:value={newHasComorbidity}
        >
          <option value="false">Não</option>
          <option value="true">Sim</option>
        </select>
      </div>
    </div>
    <button
      class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      on:click={createEmployee}
    >
      Salvar
    </button>
  </div>

  <div class="bg-white p-4 rounded shadow-md">
    <h2 class="text-xl font-bold mb-4">Nova Vacina</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="newVaccineName" class="block text-sm mb-1"
          >Nome da Vacina</label
        >
        <input
          id="newVaccineName"
          class="w-full border rounded px-2 py-1"
          bind:value={newVaccineName}
          placeholder="Ex: Pfizer"
        />
      </div>
    </div>
    <button
      class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      on:click={createVaccine}
    >
      Salvar
    </button>
  </div>

  <div class="overflow-auto bg-white rounded shadow-md">
    <table class="min-w-full">
      <thead class="bg-gray-200">
        <tr>
          <th class="px-4 py-2 text-left">CPF</th>
          <th class="px-4 py-2 text-left">Nome</th>
          <th class="px-4 py-2 text-left">Nascimento</th>
          <th class="px-4 py-2 text-left">Comorbidade?</th>
          <th class="px-4 py-2 text-left">Doses Aplicadas</th>
          <th class="px-4 py-2 text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each employees as emp}
          <tr class="border-b">
            <td class="px-4 py-2">{emp.document}</td>
            <td class="px-4 py-2">{emp.fullName}</td>
            <td class="px-4 py-2">{formatDate(emp.birthDate)}</td>
            <td class="px-4 py-2">{emp.hasComorbidity ? "Sim" : "Não"}</td>
            <td class="px-4 py-2">
              {#if emp.doses?.length}
                <ul class="list-disc pl-5">
                  {#each emp.doses as d}
                    <li>
                      {formatDate(d.dateAdministered)} - {d.vaccine?.name ||
                        "Vacina ID: " + d.vaccineId}
                    </li>
                  {/each}
                </ul>
              {:else}
                <span class="text-sm text-gray-600">Nenhuma dose</span>
              {/if}
            </td>
            <td class="px-4 py-2 text-center space-x-1">
              <button
                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                on:click={() => openEdit(emp)}
              >
                Editar
              </button>
              <button
                class="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                on:click={() => openDoses(emp)}
              >
                Doses
              </button>
              <button
                class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                on:click={() => removeEmployee(emp.uuid)}
              >
                Excluir
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="bg-white p-4 rounded shadow-md">
    <h2 class="text-xl font-bold mb-4">Relatório de Não Vacinados</h2>
    <button
      class="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      on:click={fetchNonVaccinatedReport}
    >
      Gerar Relatório
    </button>
    {#if nonVaccinatedReport.length > 0}
      <table class="min-w-full">
        <thead class="bg-gray-200">
          <tr>
            <th class="px-4 py-2 text-left">CPF</th>
            <th class="px-4 py-2 text-left">Nome</th>
          </tr>
        </thead>
        <tbody>
          {#each nonVaccinatedReport as report}
            <tr class="border-b">
              <td class="px-4 py-2">{report.document}</td>
              <td class="px-4 py-2">{report.fullName}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

{#if showEditModal}
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-md w-full max-w-xl relative">
      <button
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        on:click={() => (showEditModal = false)}>&times;</button
      >

      <h2 class="text-xl font-bold mb-4">Editar Funcionário</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="editDocument" class="block text-sm mb-1">CPF</label>
          <input
            id="editDocument"
            class="w-full border rounded px-2 py-1 bg-gray-100"
            bind:value={editDocument}
            readonly
          />
        </div>

        <div>
          <label for="editFullName" class="block text-sm mb-1"
            >Nome Completo</label
          >
          <input
            id="editFullName"
            class="w-full border rounded px-2 py-1"
            bind:value={editFullName}
          />
        </div>

        <div>
          <label for="editBirthDate" class="block text-sm mb-1"
            >Data de Nascimento</label
          >
          <input
            id="editBirthDate"
            type="date"
            class="w-full border rounded px-2 py-1"
            bind:value={editBirthDate}
          />
        </div>

        <div>
          <label for="editHasComorbidity" class="block text-sm mb-1"
            >Comorbidade?</label
          >
          <select
            id="editHasComorbidity"
            class="w-full border rounded px-2 py-1"
            bind:value={editHasComorbidity}
          >
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>
        </div>
      </div>

      <button
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        on:click={saveEdit}
      >
        Salvar
      </button>
    </div>
  </div>
{/if}

{#if showDosesModal}
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-6 rounded shadow-md w-full max-w-xl relative">
      <button
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        on:click={() => (showDosesModal = false)}>&times;</button
      >

      <h2 class="text-xl font-bold mb-4">Gerenciar Doses - {doseEmployeeId}</h2>

      {#if currentDoses.length === 0}
        <p class="text-gray-600 mb-4">Nenhuma dose aplicada.</p>
      {:else}
        <table class="min-w-full mb-4 bg-gray-50">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left">Data</th>
              <th class="px-4 py-2 text-left">Vacina</th>
              <th class="px-4 py-2 text-left">Lote</th>
              <th class="px-4 py-2 text-left">Validade</th>
              <th class="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {#each currentDoses as d}
              <tr class="border-b">
                <td class="px-4 py-2">{formatDate(d.dateAdministered)}</td>
                <td class="px-4 py-2"
                  >{d.vaccine?.name || "Vacina ID: " + d.vaccineId}</td
                >
                <td class="px-4 py-2">{d.batch}</td>
                <td class="px-4 py-2">{formatDate(d.expirationDate)}</td>
                <td class="px-4 py-2 text-right">
                  <button
                    class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    on:click={() => removeDose(d.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}

      <div class="bg-gray-100 p-4 rounded">
        <h3 class="font-semibold mb-2">Adicionar Nova Dose</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="newDoseDateAdministered" class="block text-sm mb-1"
              >Data Aplicação</label
            >
            <input
              id="newDoseDateAdministered"
              type="date"
              class="w-full border rounded px-2 py-1"
              bind:value={newDoseDateAdministered}
            />
          </div>
          <div>
            <label for="newDoseVaccineId" class="block text-sm mb-1"
              >Vacina</label
            >
            <select
              id="newDoseVaccineId"
              class="w-full border rounded px-2 py-1"
              bind:value={newDoseVaccineId}
            >
              <option value="">Selecione uma vacina</option>
              {#each vaccines as vaccine}
                <option value={vaccine.id}>{vaccine.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="newDoseBatch" class="block text-sm mb-1">Lote</label>
            <input
              id="newDoseBatch"
              class="w-full border rounded px-2 py-1"
              bind:value={newDoseBatch}
            />
          </div>
          <div>
            <label for="newDoseExpirationDate" class="block text-sm mb-1"
              >Validade</label
            >
            <input
              id="newDoseExpirationDate"
              type="date"
              class="w-full border rounded px-2 py-1"
              bind:value={newDoseExpirationDate}
            />
          </div>
        </div>
        <button
          class="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          on:click={addDose}
        >
          Adicionar Dose
        </button>
      </div>
    </div>
  </div>
{/if}
