document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('studentForm');
    const studentNameInput = document.getElementById('studentName');
    const studentEmailInput = document.getElementById('studentEmail');
    const studentPhoneInput = document.getElementById('studentPhone');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const studentTableBody = document.querySelector('#studentTable tbody');
    const noStudentsMessage = document.getElementById('noStudentsMessage');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    let students = JSON.parse(localStorage.getItem('students')) || [];
    let editingIndex = -1; // -1 means no student is currently being edited

    // Function to save students to local storage
    const saveStudents = () => {
        localStorage.setItem('students', JSON.stringify(students));
    };

    // Function to render students in the table
    const renderStudents = (filterText = '') => {
        studentTableBody.innerHTML = ''; // Clear existing rows

        const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(filterText.toLowerCase()) ||
            student.email.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredStudents.length === 0 && filterText === '') {
            noStudentsMessage.classList.remove('hidden');
            studentTableBody.classList.add('hidden'); // Hide table body if no students
        } else {
            noStudentsMessage.classList.add('hidden');
            studentTableBody.classList.remove('hidden'); // Show table body
            if (filteredStudents.length === 0) {
                 // If filtered, but no results, show a specific message
                 studentTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No matching students found.</td></tr>';
                 return;
            }
        }


        filteredStudents.forEach((student, index) => {
            const row = studentTableBody.insertRow();
            // Store original index for actions (edit/delete)
            row.dataset.originalIndex = students.indexOf(student);

            // Add data-label for responsive table on small screens
            row.innerHTML = `
                <td data-label="Name">${student.name}</td>
                <td data-label="Email">${student.email}</td>
                <td data-label="Phone No">${student.phone}</td>
                <td data-label="Actions">
                    <button class="btn edit-btn" data-index="${row.dataset.originalIndex}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn delete-btn" data-index="${row.dataset.originalIndex}"><i class="fas fa-trash-alt"></i> Delete</button>
                </td>
            `;
        });
    };

    // Function to add or update a student
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = studentNameInput.value.trim();
        const email = studentEmailInput.value.trim();
        const phone = studentPhoneInput.value.trim();

        if (name && email && phone) {
            const newStudent = { name, email, phone };

            if (editingIndex === -1) {
                // Add new student
                students.push(newStudent);
                displayMessage('Student added successfully!', 'success');
            } else {
                // Update existing student
                students[editingIndex] = newStudent;
                editingIndex = -1; // Reset editing state
                addStudentBtn.textContent = 'Add Student'; // Change button text back
                displayMessage('Student updated successfully!', 'success');
            }

            saveStudents();
            renderStudents();
            studentForm.reset(); // Clear the form
        } else {
            displayMessage('Please fill in all fields.', 'error');
        }
    });

    // Event delegation for Edit and Delete buttons
    studentTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            const indexToDelete = parseInt(btn.dataset.index);

            if (confirm('Are you sure you want to delete this student?')) {
                students.splice(indexToDelete, 1);
                saveStudents();
                renderStudents();
                displayMessage('Student deleted successfully!', 'success');
                 // If the deleted student was the one being edited, clear the form
                if (editingIndex === indexToDelete) {
                    studentForm.reset();
                    editingIndex = -1;
                    addStudentBtn.textContent = 'Add Student';
                }
            }
        }

        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const btn = e.target.closest('.edit-btn');
            editingIndex = parseInt(btn.dataset.index);
            const studentToEdit = students[editingIndex];

            studentNameInput.value = studentToEdit.name;
            studentEmailInput.value = studentToEdit.email;
            studentPhoneInput.value = studentToEdit.phone;

            addStudentBtn.textContent = 'Update Student'; // Change button text
            displayMessage('Editing student...', 'info');
            // Scroll to the form section
            studentForm.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Clear Form button functionality
    clearFormBtn.addEventListener('click', () => {
        studentForm.reset();
        editingIndex = -1; // Reset editing state
        addStudentBtn.textContent = 'Add Student'; // Change button text back
        displayMessage('Form cleared.', 'info');
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        renderStudents(searchInput.value);
        if (searchInput.value.trim() !== '') {
            clearSearchBtn.style.display = 'inline-block'; // Show clear button if there's text
        } else {
            clearSearchBtn.style.display = 'none'; // Hide if empty
        }
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderStudents();
        clearSearchBtn.style.display = 'none';
    });


    // Function to display temporary messages (e.g., success, error)
    const displayMessage = (message, type) => {
        let messageElement = document.getElementById('appMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'appMessage';
            messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                animation: fadeOut 4s forwards;
            `;
            document.body.appendChild(messageElement);
        }

        messageElement.textContent = message;
        messageElement.className = ''; // Reset classes
        if (type === 'success') {
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
            messageElement.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            messageElement.style.backgroundColor = '#f8d7da';
            messageElement.style.color = '#721c24';
            messageElement.style.border = '1px solid #f5c6cb';
        } else if (type === 'info') {
            messageElement.style.backgroundColor = '#d1ecf1';
            messageElement.style.color = '#0c5460';
            messageElement.style.border = '1px solid #bee5eb';
        }

        messageElement.style.display = 'block'; // Ensure it's visible

        // Remove the message after a few seconds
        setTimeout(() => {
            if (messageElement) {
                messageElement.style.display = 'none';
            }
        }, 3000); // Hide after 3 seconds
    };

    // Add CSS for fadeOut animation (add to style.css or dynamically)
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        @keyframes fadeOut {
            0% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); display: none; }
        }
    `;
    document.head.appendChild(styleSheet);


    // Initial render when the page loads
    renderStudents();
    clearSearchBtn.style.display = 'none'; // Hide clear search button initially
});