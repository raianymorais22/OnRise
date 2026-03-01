document.addEventListener("DOMContentLoaded", () => {

    const addButton = document.getElementById("add-content-card-btn");

    new Sortable(document.getElementById("content-edit-grid"), {
        animation: 150,
        ghostClass: "drag-ghost",       
        chosenClass: "drag-selected",   
        dragClass: "drag-moving",       
        handle: ".icon-wrapper",        
        filter: "#add-content-card-btn", 
        onMove: (evt) => {
            if (evt.related === addButton) return false;
        }
    });

});