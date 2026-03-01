document.addEventListener("DOMContentLoaded", () => {

    function updateContentTypeSections() {

        // Pega o tipo atual selecionado
        const selected = document.querySelector("input[name='content-type']:checked").id;
        const type = selected.replace("type-", ""); // Ex: "video", "text", ...

        // Oculta TODAS as seções
        document.querySelectorAll(".content-type-section").forEach(sec => {
            sec.style.display = "none";
        });

        // Mostra a selecionada
        const target = document.querySelector("." + type + "-section");
        if (target) target.style.display = "block";
    }

    // Listener nos 4 radios
    document.querySelectorAll("input[name='content-type']").forEach(radio => {
        radio.addEventListener("change", updateContentTypeSections);
    });

    // Inicializa exibindo o tipo padrão (vídeo)
    updateContentTypeSections();
});
