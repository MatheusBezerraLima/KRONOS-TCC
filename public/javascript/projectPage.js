const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const categoryBoardSelection = document.querySelectorAll(".category")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const openOrderModalArea = document.querySelector(".orderProjects")
const orderModal = document.querySelector(".orderProjectModal")

menuLinksSelection.forEach(item => {

    // adicionado evento de clique para cada item do link
    item.addEventListener("click", () => {

        // para cada link do menu estou removendo a classe select
        menuLinksSelection.forEach(i => {
            i.classList.remove("selected");
        });

        // depois estou colocando elas de novo
        item.classList.add("selected");
    });
});

categoryBoardSelection.forEach(item => {
    item.addEventListener("click", () => {
        
        categoryBoardSelection.forEach(i =>{
            i.classList.remove("selectedCategory");
        });

        item.classList.add("selectedCategory");
    });
});

// Função de fechar e abrir menu

closeMenu.addEventListener("click", toggleMenu);

function toggleMenu() {
    sideMenu.classList.toggle("asideClosed");
}

openOrderModalArea.addEventListener("click", () => {

    event.stopPropagation();
    openOrderModalArea.classList.toggle("orderProjectsSelected")
    orderModal.classList.toggle("orderProjectModalHidden")
    
})

/* Fechar modal de ordenar tarefas clicando fora do modal  */
document.addEventListener("click", (event) => {
    const isModalOpen = !orderModal.classList.contains("orderProjectModalHidden")

    if(isModalOpen && !orderModal.contains(event.target) && !openOrderModalArea.contains(event.target)){
        openOrderModalArea.classList.remove("orderProjectsSelected")
        orderModal.classList.add("orderProjectModalHidden")
    }
    console.log();
    
})
