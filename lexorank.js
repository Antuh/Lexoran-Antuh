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
  
  function calcLexorank(a, b) {
    const maxLength = Math.max(a.length, b.length);
    let result = '';
  
    for (let i = 0; i < maxLength; i++) {
      const charCodeA = a.charCodeAt(i) || 0;
      const charCodeB = b.charCodeAt(i) || 0;
      const charCodeResult = Math.floor((charCodeA + charCodeB) / 2);
      result += String.fromCharCode(charCodeResult);
    }
    return result;
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
      const textInput = document.getElementById('text-input');
      const priorityInput = document.getElementById('priority-input');
      const statusInput = document.getElementById('status-input');
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
          "status": statusInput.value,
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
  
      textInput.value = '';
      priorityInput.value = '';
    })
  }
  
  function fetchData() {
    fetch('http://localhost:8082/databases/TodoListDatabase/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        Query: 'from task order by priority'
      }),
    })
    .then(response => response.json())
    .then(data => {
      let tasks = data.Results.map(task => {
        return {
          id: task['@metadata']['@id'],
          text: task.text,
          priority: task.priority,
          status: task.status
        }
      });
      displayTasks(tasks);
    })
    .catch(error => {
      console.error(error);
    });
  }
  
  function displayTasks(tasks) {
    const taskList = document.querySelector('#task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.innerHTML = `
        <div><span class="task-priority">${task.priority}</span> ${task.text}</div>
        <div>Status: ${task.status}</div>
        <button class="delete-button" data-id="${task.id}">Delete</button>
      `;
      taskList.appendChild(taskItem);
  
      const deleteButton = taskItem.querySelector('.delete-button');
      deleteButton.addEventListener('click', function() {
        const taskId = deleteButton.getAttribute('data-id');
        deleteTask(taskId);
      });
    });
  }
  
  function deleteTask(id) {
    fetch(`http://localhost:8082/databases/TodoListDatabase/docs/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    })
    .then(response => response.json())
    .then(() => {
      fetchData();
    })
    .catch(error => {
      console.error(error);
    });
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    createTask();
    fetchData();
  });