const menuLinksSelection = document.querySelectorAll("ul .selection-aside")
const closeMenu = document.querySelector(".toggleIcon")
const sideMenu = document.querySelector("aside")
const userProfile = document.querySelector(".userProfile")
const userProfileModal = document.querySelector(".userModal")


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

closeMenu.addEventListener("click", toggleMenu);

function toggleMenu() {
    sideMenu.classList.toggle("asideClosed");
}

/* Abrir modal do usuario */

userProfile.addEventListener("click", ()=>{
    userProfileModal.classList.toggle("hidden")
    userProfile.classList.toggle("userProfileSelected")
})
