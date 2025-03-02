<script setup lang="ts">
import { store } from "../store.ts";
import { useRouter } from 'vue-router';
import {ref, onMounted, watch, computed} from 'vue';
import axios from 'axios';


import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import { FilterMatchMode } from '@primevue/core/api';
import IconField from "primevue/iconfield";
import {InputIcon} from "primevue";
import {Dialog} from "primevue";

const router = useRouter();
const users = ref();
const editingRows = ref([]);


function logOut() {
  store.logout();
  router.push('/');
}



const fetchData = async () => {
  if (!store.authToken) {
    console.error("No token available.");
    return;
  }

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/logic/users`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': store.authToken
      }
    });
    users.value = response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
  }
};

async function updateUserData(payload: string) {
  try {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/database/updateUserData`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': store.authToken,
          }
        }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

async function importUsers() {
  if (!store.authToken) {
    console.error("No token available.");
    return;
  }
  try {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_API_BASE_URL}/database/import-users`,
      headers: {
        'Authorization': store.authToken
      }
    };
    await axios.request(config)
    await fetchData()
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}

async function deleteUser() {
  try {
    const deletePromises = selectedUser.value.map(async (user: any) => {
      const payload = {
        id: user.id  // Assuming 'id' is the field in your selectedUser object
      };

      const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/database/removeUser`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': store.authToken,
            }
          }
      );

      return response.data;  // Return the response for each user
    });

    // Wait for all requests to finish
    const results = await Promise.all(deletePromises);

    console.log('All users deleted:', results);
    await fetchData();
    return results;  // Return all responses
  } catch (error) {
    console.error('Error deleting users:', error);
    throw error;
  }

}



// Watch for changes to the authToken and trigger fetch once available
watch(() => store.authToken, (newToken) => {
  console.log('newtoken')
  if (newToken) {
    fetchData();  // Fetch data once the token is available
  }
});

// On component mounted, make sure to initialize the token and trigger fetch if available
onMounted(() => {
  console.log('onmount')
  if (store.authToken) {
    fetchData();
  }
});

const onRowEditSave = (event: any) => {
  let { newData } = event;


  updateUserData(JSON.stringify(newData))
      .catch((error) => {
        console.error('Failed to update user:', error);
      });
  fetchData()
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const selectedUser = ref();
const visible = ref(false);








interface User {
  id: string;
  displayName: string;
  timezone: string;
  fieldOfWork: string;
  targetLanguage: string;
}

const user = ref<User>({
  id: '',
  displayName: '',
  timezone: '',
  fieldOfWork: '',
  targetLanguage: '',
});
// Computed property to check if the form is valid (i.e. required fields are filled)
const isFormValid = computed(() => {
  return user.value.id.trim() !== '';
});

const openDialog = () => {
  visible.value = true;
};

const closeDialog = () => {
  visible.value = false;
};


const addUser = async () => {
  try {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/database/addUser`,
        JSON.stringify(user.value),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': store.authToken,
          }
        }
    );
    console.log('User added successfully:', response.data);
  } catch (error) {
    console.error('Error adding user:', error);
  } finally {
  }
};

const onSave = async () => {
  if (isFormValid.value) {
    await addUser();
    closeDialog();
    await fetchData()
    user.value = {
      id: '',
      displayName: '',
      timezone: '',
      fieldOfWork: '',
      targetLanguage: '',
    };
  }
};

function redirectAPI() {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api`;
}
</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-100 p-4 shadow-md flex-none">
      <!-- Logo -->
      <h1 class="text-2xl font-bold text-blue-500 mb-6">SC AI Extention</h1>
      <!-- Sidebar Navigation -->
      <nav class="space-y-2 " >
        <Button class="sidebar-button flex items-center gap-2" style="margin-bottom: 5rem;">
          <i class="pi pi-home"></i>
          <span>Dashboard</span>
        </Button>
        <Button class="sidebar-button flex items-center gap-2" style="margin-bottom: 5rem;">
          <i class="pi pi-file-pdf"></i>
          <span>Generate Report</span>
        </Button>
        <Button class="sidebar-button flex items-center gap-2" style="margin-bottom: 5rem;" @click="redirectAPI">
          <i class="pi pi-angle-double-right"></i>
          <span>API Documentation</span>
        </Button>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <div class="card flex justify-center">
        <Dialog v-model:visible="visible" modal header="Add User" :style="{ width: '25rem' }">
          <form @submit.prevent="onSave" novalidate>
            <!-- Name Input -->
            <div class="flex items-center gap-4">
              <div class="md:col-4">
                <label for="name" class="font-semibold w-24">Name</label>
              </div>
              <div class="md:col-6">
                <InputText id="name" v-model="user.displayName" autocomplete="off" class="input-field" />
              </div>
            </div>

            <!-- ID Input (Required) -->
            <div class="flex items-center gap-4">
              <div class="md:col-4">
                <label for="id" class="font-semibold w-24">ID</label>
              </div>
              <div class="md:col-6">
                <InputText id="id" v-model="user.id" autocomplete="off" class="input-field" required />
              </div>
            </div>

            <!-- Timezone Input -->
            <div class="flex items-center gap-4">
              <div class="md:col-4">
                <label for="timezone" class="font-semibold w-24">Timezone</label>
              </div>
              <div class="md:col-6">
                <InputText id="timezone" v-model="user.timezone" autocomplete="off" class="input-field" />
              </div>
            </div>

            <!-- Field of Work Input -->
            <div class="flex items-center gap-4">
              <div class="md:col-4">
                <label for="fieldOfWork" class="font-semibold w-24">Field of Work</label>
              </div>
              <div class="md:col-6">
                <InputText id="fieldOfWork" v-model="user.fieldOfWork" autocomplete="off" class="input-field" />
              </div>
            </div>

            <!-- Target Language Input -->
            <div class="flex items-center gap-4 mb-3">
              <div class="md:col-4">
                <label for="targetLanguage" class="font-semibold w-24">Target Language</label>
              </div>
              <div class="md:col-6">
                <InputText id="targetLanguage" v-model="user.targetLanguage" autocomplete="off" class="input-field" />
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-2 justify-end">
              <Button type="button" label="Cancel" severity="secondary" @click="closeDialog" />
              <Button type="submit" label="Save" :disabled="!isFormValid" />
            </div>
          </form>
        </Dialog>
      </div>

      <div class="logout-container">
        <Button label="Logout" icon="pi pi-sign-out" class="p-button-danger" @click="logOut" />
      </div>

      <div class="toolbar">
        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteUser" />
        <Button label="Add User" icon="pi pi-user-plus" @click="openDialog" />
        <Button label="Import Users" icon="pi pi-cloud-download" @click="importUsers" />
        <div class="search-container">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
        </div>
      </div>

      <div class="card">
        <!-- DataTable for Users -->
        <DataTable
            v-model:editingRows="editingRows"
            :value="users"
            editMode="row"
            dataKey="id"
            @row-edit-save="onRowEditSave"
            removableSort
            scrollable
            scrollHeight="85vh"
            tableStyle="min-width: 50rem"
            v-model:filters="filters"
            v-model:selection="selectedUser"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column field="displayName" header="Name" sortable>
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" />
            </template>
          </Column>
          <Column field="id" header="ID"></Column>
          <Column field="timezone" header="Timezone" sortable>
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" />
            </template>
          </Column>
          <Column field="fieldOfWork" header="Field of Work" sortable>
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" />
            </template>
          </Column>
          <Column field="targetLanguage" header="Target Language" sortable>
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" />
            </template>
          </Column>
          <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logout-container {
  position: absolute;
  top: 10px;
  right: 10px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 2vw;
  padding: 1rem;
}

.search-container {
  margin-left: auto;
  display: flex;
  align-items: center;
}

/* Sidebar Button Styles */


.sidebar-button:hover {
  background-color: #235ac8;
}

i {
  font-size: 1.2rem;
}
</style>
