<script setup lang="ts">
import { store } from "../store.ts";
import { useRouter } from 'vue-router';
import {ref, onMounted, watch} from 'vue';
import axios from 'axios';


import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';

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
    console.log(response.data)
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
  let { newData, index } = event;


  updateUserData(JSON.stringify(newData))
      .then(() => {
        users.value[index] = newData;
        console.log('i just saved something')
      })
      .catch((error) => {
        console.error('Failed to update user:', error);
      });
};





</script>


<template>
  <div class="logout-container">
    <Button label="Logout" icon="pi pi-sign-out" class="p-button-danger" @click="logOut" />
  </div>

  <div class="grid home-container">
    <div class="col-12 md:col-3"></div>

    <div class="col-12 md:col-8">
      <div class="card">
        <!-- DataTable for Users -->
        <DataTable v-model:editingRows="editingRows"
                   :value="users"
                   editMode="row"
                   dataKey="id"
                   @row-edit-save="onRowEditSave"
                   tableStyle="min-width: 50rem">

          <Column field="id" header="ID"></Column>

          <Column field="displayName" header="Name" style="width: 25%">
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" />
            </template>
          </Column>

          <Column field="timezone" header="Timezone" style="width: 25%">
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" />
            </template>
          </Column>

          <Column field="fieldOfWork" header="Field of Work" style="width: 25%">
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" />
            </template>
          </Column>

          <Column field="targetLanguage" header="Target Language" style="width: 25%">
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
