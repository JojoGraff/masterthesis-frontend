<script setup lang="ts">
import { store } from "../store.ts";
import { useRouter } from 'vue-router';
import {ref, onMounted, watch} from 'vue';
import axios from 'axios';


import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import { FilterMatchMode } from '@primevue/core/api';
import IconField from "primevue/iconfield";
import {InputIcon} from "primevue";

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





</script>


<template>
  <div class="logout-container">
    <Button label="Logout" icon="pi pi-sign-out" class="p-button-danger" @click="logOut" />

        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
        </IconField>

    <Button label="Delete" icon="pi pi-sign-out" class="p-button-danger" @click="deleteUser" />
    <Button label="Import Users" icon="pi pi-sign-out" @click="importUsers" />


  </div>

  <div class="grid home-container">
    <div class="col-12 md:col-2"></div>

    <div class="col-12 md:col-9">
      <div class="card">

        <!-- DataTable for Users -->
        <DataTable v-model:editingRows="editingRows"
                   :value="users"
                   editMode="row"
                   dataKey="id"
                   @row-edit-save="onRowEditSave"
                   removableSort
                   scrollable scrollHeight="85vh"
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

          <Column field="id" header="ID" ></Column>

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

    <div class="col-12 md:col-1"></div>
  </div>
</template>

<style scoped>
.home-container {
  padding-top: 40px;
}

.logout-container {
  position: absolute;
  top: 10px;
  right: 10px;
}

:deep(.p-datatable) {
  border-radius: 12px;
  overflow: hidden;
}
</style>
