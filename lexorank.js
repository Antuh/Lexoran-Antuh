function Lexorank(string) {
  const leadingLetterCode = string.charCodeAt(string.length - 1);
  const trailingLetterCode = string.charCodeAt(0);

  if (leadingLetterCode === 90 && trailingLetterCode === 65) {
    return null;
  }

  let result = '';

  if (leadingLetterCode < 90) {
    result = string.slice(0, -1) + String.fromCharCode(leadingLetterCode + 1);
  } else {
    if (trailingLetterCode === 90) {
      const trimmedString = string.slice(0, -1);
      result = Lexorank(trimmedString) + 'A';
    } else {
      const newTrailingLetter = String.fromCharCode(trailingLetterCode + 1);
      result = string.slice(0, -1) + newTrailingLetter;
    }
  }


  if (result === "AAAAAZ") {
    result = "AAAABA";
  }

  return result;
}
function lexorank(a, b) {
  const max_len = Math.max(a.length, b.length);

  a = a.padEnd(max_len, '0');
  b = b.padEnd(max_len, '0');

  let rank_a = 0;
  let rank_b = 0;
  for (let i = 0; i < max_len; i++) {
    rank_a += (a.charCodeAt(i) - 'A'.charCodeAt() + 1) * (26 ** (max_len - i - 1));
    rank_b += (b.charCodeAt(i) - 'A'.charCodeAt() + 1) * (26 ** (max_len - i - 1));
  }

  const mid_rank = Math.floor((rank_a + rank_b) / 2);

  let res = '';
  let temp_mid_rank = mid_rank;
  while (temp_mid_rank > 0) {
    temp_mid_rank -= 1;
    res = String.fromCharCode(temp_mid_rank % 26 + 'A'.charCodeAt()) + res;
    temp_mid_rank = Math.floor(temp_mid_rank / 26);
  }
  
  return res.padStart(max_len, 'A');
}

function generateRandomString(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function createTask() {
  let lastTaskPriority;

  fetch('http://localhost:8082/databases/TodoListDatabase/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      Query: 'from task order by priority desc'
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.Results.length > 0) {
      lastTaskPriority = data.Results[0].priority;
    } else {
      lastTaskPriority = '';
    }
  })
  .catch(error => {
    console.error(error);
  });

  let button = document.querySelector('#submit');
  button.addEventListener('click', function() {
    const textInput = document.getElementById('todoInput');
    const text = textInput.value;
    let priority;

    if (lastTaskPriority !== '') {
      priority = Lexorank(lastTaskPriority);
    } else {
      priority = "AAAAAA";
    }

    let randomId = generateRandomString(8);

    fetch('http://localhost:8082/databases/TodoListDatabase/docs?id=' + randomId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        "text": text,
        "priority": priority,
        "status": "Активно",
        "@metadata": {
          "@collection": "task"
        }
      }),
    })
    .then(response => response.json())
    .then(() => {
      fetchData();
      lastTaskPriority = priority;
    })
    .catch(error => {
      console.error(error);
    });

    //textInput.value = '';
    //priorityInput.value = '';
  })
}

function fetchData(id) {
  let query;

  if (id === 'active-sort') {
    query = 'from task where status = "Активно"';
  } else {
    if(id === 'complete-sort') {
      query = 'from task where status = "Выполнено"';
    }
    else{
      if(id === 'ascpriority-sort'){
          query = 'from task order by priority asc';
      }
      else{
          if(id === 'descpriority-sort'){
              query = 'from task order by priority desc'
          }
          else{
              query = 'from task';
          }
      }
    }
  }

  fetch('http://localhost:8082/databases/TodoListDatabase/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({ Query: query }),
  })
    .then(response => response.json())
    .then(data => {
      const table = document.getElementById('data');
      table.innerHTML = '';

      const headerRow = table.insertRow();
      const nameHeader = headerRow.insertCell(0);
      const priorityHeader = headerRow.insertCell(1);
      const statusHeader = headerRow.insertCell(2);
      const deleteHeader = headerRow.insertCell(3);
      const changeHeader = headerRow.insertCell(4);

      nameHeader.innerHTML = '<b>Наименование</b>';
      priorityHeader.innerHTML = '<b>Приоритет</b>';
      statusHeader.innerHTML = '<b>Статус</b>';
      deleteHeader.innerHTML = '<b>Действие</b>';
      changeHeader.innerHTML = '<b>Действие</b>';

    for (let i = 0; i < data.Results.length; i++) {
      const row = table.insertRow();
      //const idCell = row.insertCell(0);
      const nameCell = row.insertCell(0);
      const priorityCell = row.insertCell(1);
      const statusCell = row.insertCell(2);
      const deleteCell = row.insertCell(3);
      const changeCell = row.insertCell(4);

      //idCell.innerHTML = data.Results[i]['@metadata']['@id'];
      nameCell.innerHTML = data.Results[i].text;
      priorityCell.innerHTML = data.Results[i].priority;
      statusCell.innerHTML = data.Results[i].status;

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Удалить';
      deleteCell.appendChild(deleteButton);

      deleteButton.addEventListener('click', () => {
        const taskId = data.Results[i]['@metadata']['@id'];
        deleteTask(taskId);
      });

      const changeButton = document.createElement('button');
      changeButton.textContent = 'Изменить';
      changeCell.appendChild(changeButton);

      changeButton.addEventListener('click', () => {
        const taskId = data.Results[i]['@metadata']['@id'];
        changeTask(taskId);
      });
    }
  })
  .catch(error => {
    console.error(error);
  });
}

//////////////////
function createTaskLexorank() {
  let button = document.querySelector('#submitcalclex');
  button.addEventListener('click', function() {
    const textInputLex = document.getElementById('todoInputLex');
    const text = textInputLex.value;
    const InputLexOne = document.getElementById('prioroneInputLex');
    const lexone = InputLexOne.value;
    const InputLexTwo = document.getElementById('priortwoInputLex');
    const lextwo = InputLexTwo.value;
    const priority = lexorank (lexone, lextwo);
    console.log(lexone);
    console.log(lextwo);
    console.log(priority);

    let randomId = generateRandomString(8);

    fetch('http://localhost:8082/databases/TodoListDatabase/docs?id=' + randomId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        "text": text,
        "priority": priority,
        "status": "Активно",
        "@metadata": {
          "@collection": "task"
        }
      }),
    })
    .then(response => response.json())
    .then(() => {
      fetchData();
    })
    .catch(error => {
      console.error(error);
    });

    //textInput.value = '';
    //priorityInput.value = '';
  })
}


  const exportButton = document.getElementById('export-json');
  exportButton.addEventListener('click', () => {
  const query = 'from task';
  const filename = 'result.json';

  fetch('http://localhost:8082/databases/TodoListDatabase/queries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    body: JSON.stringify({ Query: query }),
  })
    .then(response => response.json())
    .then(data => {
      const jsonData = JSON.stringify(data);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log(`Data exported successfully to ${filename}`);
    })
    .catch(error => {
      console.error('Error exporting data:', error);
    });
});
const importFileInput = document.getElementById('import-file-input');
const importButton = document.getElementById('import-button');
importButton.addEventListener('click', () => {
  const file = importFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = event => {
      const jsonData = event.target.result;
      const data = JSON.parse(jsonData);

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
      
      let randimportjsonid = generateRandomString(8)

      const url = 'http://localhost:8082/databases/TodoListDatabase/docs?id='+ randimportjsonid;
      fetch(url, requestOptions)
        .then(response => {
          if (response.ok) {
            console.log('Data imported successfully');
          } else {
            console.error('Error importing data:', response.status);
          }
        })
        .catch(error => {
          console.error('Error importing data:', error);
        });
    };
    reader.readAsText(file);
  }
});

function changeTask(id) {
  const requestUrl = `http://localhost:8082/databases/TodoListDatabase/docs?id=${id}`;
  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      const modal = document.createElement('div');
      modal.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5);'
      const modalContent = document.createElement('div');
      modalContent.style = 'background-color: white; width: 500px; height: 400px; margin: 100px auto; padding: 20px;';
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '&times;';
      closeButton.style = 'position: absolute; top: 10px; right: 10px; font-size: 20px; font-weight: bold; border: none; background-color: white; cursor: pointer;';
      modalContent.appendChild(closeButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      const titleInput = document.createElement('input');
      titleInput.value = data.text ? data.text : ''; 
      modalContent.appendChild(document.createTextNode('Наименование: '));
      modalContent.appendChild(titleInput);
      modalContent.appendChild(document.createElement('br'));

      /*const priorityInput = document.createElement('select');
      priorityInput.innerHTML = `
        <option value="6" ${data.priority === '1' ? 'selected' : ''}>Высокий</option>
        <option value="5" ${data.priority === '2' ? 'selected' : ''}>Средний</option>
        <option value="4" ${data.priority === '3' ? 'selected' : ''}>Низкий</option>
      `;
      modalContent.appendChild(document.createTextNode('Приоритет: '));
      modalContent.appendChild(priorityInput);
      modalContent.appendChild(document.createElement('br'));*/

      const priorityInput = document.createElement('input');
      priorityInput.type = 'number'; 
      priorityInput.value = data.priority ? data.priority : ''; 
      modalContent.appendChild(document.createTextNode('Приоритет: '));
      modalContent.appendChild(priorityInput);
      modalContent.appendChild(document.createElement('br'));

      priorityInput.addEventListener('keydown', (event) => {
        if (!/^\d*$/.test(event.key)) { 
          event.preventDefault(); 
        }
      });

      const statusInput = document.createElement('select');
      statusInput.innerHTML = `
        <option value="Активно" ${data.status === 'Активно' ? 'selected' : ''}>Активно</option>
        <option value="Выполнено" ${data.status === 'Выполнено' ? 'selected' : ''}>Выполнено</option>
      `;
      modalContent.appendChild(document.createTextNode('Статус: '));
      modalContent.appendChild(statusInput);
      modalContent.appendChild(document.createElement('br'));

      const updateButton = document.createElement('button');
      updateButton.textContent = 'Изменить';
      modalContent.appendChild(updateButton);

      updateButton.addEventListener('click', () => {
        const updatedData = {
          "text": titleInput.value,
          "priority": priorityInput.value,
          "status": statusInput.value,
          "@metadata": {
              "@collection": "task"
          }
        };

        fetch(requestUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        })
        .then(response => {
          if (response.ok) {
            document.body.removeChild(modal);
            const currentRow = document.getElementById(id);
          } else {
            throw new Error('Ошибка при изменении задачи');
          }
        })
        .catch(error => {
          console.error(error);
          alert('Ошибка при изменении задачи');
        });
      });

      closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    })
    .catch(error => {
      console.error(error);
      alert('Ошибка при загрузке задачи');
    });
}

function deleteTask(id) {
  fetch(`http://localhost:8082/databases/TodoListDatabase/docs?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  })
    .then(response => {
      if (response.ok) {
        const rows = document.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.firstChild.textContent === id) {
            row.parentNode.removeChild(row);
            break;
          }
        }
      } else {
        console.error(`Ошибка удаления документа с id ${id}`);
      }
    })
    .catch(error => {
      console.error(`Ошибка удаления документа с id ${id}`, error);
    });
}

const exporttsvButton = document.getElementById('export-tsv');
exporttsvButton.addEventListener('click', () => {
const query = 'from task';
const filename = 'result.tsv';

fetch('http://localhost:8082/databases/TodoListDatabase/queries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  body: JSON.stringify({ Query: query }),
})
  .then(response => response.json())
  .then(data => {
    const tsvData = data.Results.map(result => Object.values(result).join('\t')).join('\n');
    const blob = new Blob([tsvData], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log(`Data exported successfully to ${filename}`);
  })
  .catch(error => {
    console.error('Error exporting data:', error);
  });
});

window.addEventListener('DOMContentLoaded', () => {
  createTaskLexorank();
  createTask();
  fetchData();
});

