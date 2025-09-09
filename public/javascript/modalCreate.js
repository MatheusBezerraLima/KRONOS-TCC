const openModalBtn = document.querySelector('.buttonCreate');
const modal = document.getElementById(openModalBtn.getAttribute('data-modal'));
const closeModalBtn = document.getElementById('closeModalBtn');

openModalBtn.addEventListener('click', function() {
    modal.showModal();  
});