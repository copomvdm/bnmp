
// Função para prevenir o comportamento padrão do navegador
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Função para destacar a área de drag ao arrastar
function highlight() {
    const dragArea = document.getElementById('drag-area');
    dragArea.classList.add('dragover');
}

// Função para remover o destaque ao sair da área de drag
function unhighlight() {
    const dragArea = document.getElementById('drag-area');
    dragArea.classList.remove('dragover');
}

// Função para lidar com o arquivo arrastado
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Função para exibir o modal de erro com a mensagem apropriada
function showModalError(message) {
    const modalBody = document.querySelector("#modalErroArquivo .modal-body");
    modalBody.textContent = message;
    const modalErro = new bootstrap.Modal(document.getElementById('modalErroArquivo'));
    modalErro.show();
}

// Função para carregar e exibir o arquivo
function handleFiles(files) {
    const fileInput = document.getElementById('input-file');

    // Verificar se mais de um arquivo foi selecionado ou arrastado
    if (files.length > 1) {
        showModalError("Você só pode carregar um arquivo por vez.");
        return;
    }

    const file = files[0];

    // Verificar se o arquivo é um PDF
    if (file.type !== "application/pdf") {
        // Se não for PDF, mostrar modal de erro
        showModalError("O arquivo selecionado não é um PDF. Por favor, carregue um arquivo no formato PDF.");

        // Limpar o input quando o modal for fechado
        const modalElement = document.getElementById('modalErroArquivo');
        modalElement.addEventListener('hidden.bs.modal', function () {
            fileInput.value = ''; // Limpa o arquivo
            const nomePdfSpan = document.getElementById('nome-pdf');
            nomePdfSpan.textContent = "Nenhum ficheiro selecionado";
        });

        return;
    }

    // Simular que o arquivo foi carregado no input-file
    fileInput.files = files;
    
    // Atualizar o estado da interface, como se tivesse sido feito o upload por clique
    const fileName = file ? file.name : "Nenhum ficheiro selecionado";
    const infoPdfDiv = document.getElementById('info-pdf');
    const nomePdfSpan = document.getElementById('nome-pdf');
    const btnAnalisarPDF = document.getElementById('btnAnalisarPDF');
    const possuiFotoPDF = document.getElementById('possuiFotoPDF');
    const divCarregarPDF = document.getElementById('div-carregarPDF');

    if (file) {
        nomePdfSpan.textContent = fileName;
        infoPdfDiv.classList.remove('d-none');
        btnAnalisarPDF.classList.remove('d-none');
        possuiFotoPDF.classList.remove('d-none');
        divCarregarPDF.classList.add('d-none');
    } else {
        nomePdfSpan.textContent = "Nenhum ficheiro selecionado";
        infoPdfDiv.classList.add('d-none');
        btnAnalisarPDF.classList.add('d-none');
        possuiFotoPDF.classList.add('d-none');
        divCarregarPDF.classList.remove('d-none');
    }
}

// Manter a funcionalidade do botão de upload
document.getElementById('input-file').addEventListener('change', function(event) {
    const files = event.target.files;
    handleFiles(files);
});

// Selecionar a área de drag-and-drop
const dragArea = document.getElementById('drag-area');

// Adicionar eventos de drag-and-drop
dragArea.addEventListener('dragenter', preventDefaults, false);
dragArea.addEventListener('dragover', preventDefaults, false);
dragArea.addEventListener('dragover', highlight, false);
dragArea.addEventListener('dragleave', unhighlight, false);
dragArea.addEventListener('drop', preventDefaults, false);
dragArea.addEventListener('drop', unhighlight, false);
dragArea.addEventListener('drop', handleDrop, false);

// Evento de clique para excluir PDF
document.getElementById('fecharPDF').addEventListener('click', function() {
    const fileInput = document.getElementById('input-file');
    const nomePdfSpan = document.getElementById('nome-pdf');
    const infoPdfDiv = document.getElementById('info-pdf');
    const btnAnalisarPDF = document.getElementById('btnAnalisarPDF');
    const possuiFotoPDF = document.getElementById('possuiFotoPDF');
    const checkPossuiFotoPDF = document.getElementById('checkPossuiFotoPDF');  // Seleciona o checkbox
    const divCarregarPDF = document.getElementById('div-carregarPDF');
    const textareaResultado = document.getElementById('textareaResultado');  // Seleciona o textarea
    const sectionResultado = document.getElementById('section-resultado');   // Seleciona a section de resultados
    const sectionTabela = document.getElementById('section-tabela');         // Seleciona a section da tabela

    // Limpar o input de arquivo
    fileInput.value = '';
    nomePdfSpan.textContent = "Nenhum ficheiro selecionado";

    // Ocultar as informações do PDF e o botão de análise
    infoPdfDiv.classList.add('d-none');
    btnAnalisarPDF.classList.add('d-none');
    possuiFotoPDF.classList.add('d-none');

    // Mostrar a div que contém o botão "Carregar PDF" novamente
    divCarregarPDF.classList.remove('d-none'); // Mostrar

    // Limpar o conteúdo do textarea
    textareaResultado.value = '';  // Limpa o texto

    // Ocultar novamente a section de resultado
    sectionResultado.classList.add('d-none');  // Oculta a section de resultado

    // Desmarcar o checkbox
    checkPossuiFotoPDF.checked = false;  // Desmarca o checkbox

    // Limpar o conteúdo da tabela
    document.getElementById('nome-tabela').textContent = '';
    document.getElementById('rg-tabela').textContent = '';
    document.getElementById('cpf-tabela').textContent = '';
    document.getElementById('artigos-tabela').textContent = '';

    // Ocultar a tabela
    sectionTabela.classList.add('d-none');  // Oculta a section da tabela

    // Limpar o console
    console.clear();
});




console.clear;
