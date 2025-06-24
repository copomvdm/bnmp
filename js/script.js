document.addEventListener('DOMContentLoaded', function () {

    // Inicializar tooltips do Bootstrap
    const inicializarTooltips = () => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    };
    inicializarTooltips();

    // Seletores de elementos da UI
    const dragArea = document.getElementById('drag-area');
    const inputFile = document.getElementById('input-file');
    const infoPdfDiv = document.getElementById('info-pdf');
    const divCarregarPDF = document.getElementById('div-carregarPDF');
    const fecharPdfBtn = document.getElementById('fecharPDF');
    const listaArquivosDiv = document.getElementById('lista-arquivos');
    const btnAnalisarPDF = document.getElementById('btnAnalisarPDF');
    const procurarArquivoLabel = document.getElementById('lbl-input-file');
    const resultadosContainer = document.getElementById('resultados-container');
    const sectionTabela = document.getElementById('section-tabela');
    const tabelaCorpo = document.getElementById('tabela-corpo');
    const templateResultado = document.getElementById('template-resultado-card');
    const confirmacaoModalEl = document.getElementById('modalConfirmarExclusao');
    const confirmacaoModal = new bootstrap.Modal(confirmacaoModalEl);
    const confirmacaoModalTexto = document.getElementById('confirmacao-modal-texto');
    const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
    const selectEquipe = document.getElementById('select-equipe');
    const btnLimparSelecaoTabela = document.getElementById('btnLimparSelecaoTabela'); 

    // INÍCIO: Seletores e instância do novo modal
    const modalVerificarProcessoEl = document.getElementById('modalVerificarProcesso');
    const modalVerificarProcesso = new bootstrap.Modal(modalVerificarProcessoEl);
    const modalProcessoConteudo = document.getElementById('modal-processo-conteudo');
    // FIM: Seletores do novo modal

    let currentManagedFiles = [];
    const MAX_FILES = 10;
    let fileIdParaExcluir = null;
    const EQUIPE_STORAGE_KEY = 'equipePadrao';
    let analiseFeitaStatus = {}; // Armazenar o status de "feito"
    
    const carregarEquipePadrao = () => {
        const equipeSalva = localStorage.getItem(EQUIPE_STORAGE_KEY);
        if (equipeSalva) {
            selectEquipe.value = equipeSalva;
        }
    };

    const salvarEquipePadrao = (equipe) => {
        localStorage.setItem(EQUIPE_STORAGE_KEY, equipe);
    };

    const atualizarTabelaComEquipe = () => {
        const equipeCompleta = selectEquipe.options[selectEquipe.selectedIndex].text;
        const linhas = tabelaCorpo.querySelectorAll('tr');
        linhas.forEach(linha => {
            if (linha.cells.length > 4) {
                linha.cells[4].textContent = equipeCompleta;
            }
        });
    };

    carregarEquipePadrao();
    
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const highlight = () => dragArea.classList.add('dragover');
    const unhighlight = () => dragArea.classList.remove('dragover');

    const showModalError = (message) => {
        const modalBody = document.querySelector("#modalErroArquivo .modal-body");
        modalBody.innerHTML = message;
        const modalErro = new bootstrap.Modal(document.getElementById('modalErroArquivo'));
        modalErro.show();
    };

    const handleFiles = (newlySelectedFiles) => {
        const newFilesArray = Array.from(newlySelectedFiles);
        const ignoredDuplicates = [];

        newFilesArray.forEach(file => {
            const isDuplicate = currentManagedFiles.some(existingFile => existingFile.name === file.name);
            
            if (isDuplicate) {
                ignoredDuplicates.push(file.name);
            } else if (file.type === "application/pdf") {
                currentManagedFiles.push(file);
            }
        });

        if (ignoredDuplicates.length > 0) {
            showToast(`Ignorado(s): ${ignoredDuplicates.join(', ')} já carregado(s).`);
        }
        updateFileUI();
    };
    
    function updateFileUI() {
        if (currentManagedFiles.length > MAX_FILES) {
            showModalError(`O limite é de ${MAX_FILES} arquivos. A sua seleção foi ajustada para o limite.`);
            currentManagedFiles = currentManagedFiles.slice(0, MAX_FILES);
        }

        const pdfFiles = currentManagedFiles;
        
        const dataTransfer = new DataTransfer();
        pdfFiles.forEach(file => dataTransfer.items.add(file));
        inputFile.files = dataTransfer.files;
        
        listaArquivosDiv.innerHTML = ''; 
        if(pdfFiles.length > 0) {
            listaArquivosDiv.className = 'row g-3 w-100 justify-content-center';
    
            pdfFiles.forEach((file, index) => {
                const col = document.createElement('div');
                col.className = 'col-lg-3 col-md-4 col-sm-6';
                col.dataset.fileId = index;
    
                const card = document.createElement('div');
                card.className = 'card h-100 text-center file-card';
                
                const cardBody = document.createElement('div');
                cardBody.className = 'card-body d-flex flex-column justify-content-center align-items-center p-2';
    
                const closeButton = document.createElement('button');
                closeButton.className = 'btn-close-file';
                closeButton.setAttribute('aria-label', 'Remover Arquivo');
                closeButton.innerHTML = '&times;';
                card.appendChild(closeButton);
    
                const icon = document.createElement('i');
                icon.className = 'bi bi-file-earmark-pdf-fill fs-1 text-danger';
    
                const fileName = document.createElement('p');
                fileName.className = 'card-text small mt-2 mb-0';
                fileName.style.wordBreak = 'break-all';
                fileName.textContent = file.name;
    
                cardBody.appendChild(icon);
                cardBody.appendChild(fileName);
                card.appendChild(cardBody);
                col.appendChild(card);
                listaArquivosDiv.appendChild(col);
            });

            infoPdfDiv.classList.remove('d-none');
            divCarregarPDF.classList.add('d-none');
        }

        if (inputFile.files.length >= MAX_FILES) {
            procurarArquivoLabel.classList.add('d-none');
        } else {
            procurarArquivoLabel.classList.remove('d-none');
        }
    }
    
    const resetUI = () => {
        currentManagedFiles = [];
        inputFile.value = '';
        infoPdfDiv.classList.add('d-none');
        divCarregarPDF.classList.remove('d-none');
        listaArquivosDiv.innerHTML = '';
        resultadosContainer.innerHTML = '';
        tabelaCorpo.innerHTML = '';
        sectionTabela.classList.add('d-none');
        procurarArquivoLabel.classList.remove('d-none');
        analiseFeitaStatus = {};
        console.clear();
    };

    function abrirModalConfirmacao(id, nome) {
        fileIdParaExcluir = id;
        const nomeAlvo = nome || "este mandado";
        confirmacaoModalTexto.textContent = `Você realmente deseja excluir o mandado de prisão de "${nomeAlvo}"?`;
        confirmacaoModal.show();
    }

    async function removerArquivoEAnalise(fileId) {
        const scrollY = window.scrollY; // 1. Salva a posição atual do scroll.
        const idToRemove = parseInt(fileId, 10);
    
        // A lógica interna para manipular os arrays e objetos permanece a mesma.
        if (analiseFeitaStatus[idToRemove] !== undefined) {
            delete analiseFeitaStatus[idToRemove];
        }
    
        const newAnaliseFeitaStatus = {};
        let newIndex = 0;
        for (let i = 0; i < currentManagedFiles.length; i++) {
            if (i !== idToRemove) {
                if (analiseFeitaStatus[i] !== undefined) {
                    newAnaliseFeitaStatus[newIndex] = analiseFeitaStatus[i];
                }
                newIndex++;
            }
        }
        analiseFeitaStatus = newAnaliseFeitaStatus;
    
        currentManagedFiles.splice(idToRemove, 1);
    
        if (currentManagedFiles.length === 0) {
            resetUI();
            return;
        }
    
        updateFileUI();
        
        // 2. Aguarda a função que recria a UI (que é assíncrona) terminar.
        await analisarErenderTodosOsResultados(false); 
    
        // 3. Restaura a posição do scroll para onde estava, de forma instantânea.
        window.scrollTo({ top: scrollY, behavior: 'instant' });
    }

    // INÍCIO: NOVA FUNÇÃO PARA VERIFICAR PROCESSOS DUPLICADOS
    function verificarProcessosDuplicados(todosOsDados) {
        // Objeto para agrupar nomes por número de processo
        const processos = {};

        // Itera sobre todos os dados extraídos
        todosOsDados.forEach(dado => {
            // Se o número do processo não for nulo ou vazio
            if (dado.numProcesso) {
                // Se o processo ainda não foi registrado, inicializa com um array
                if (!processos[dado.numProcesso]) {
                    processos[dado.numProcesso] = [];
                }
                // Adiciona o nome do procurado ao processo correspondente
                processos[dado.numProcesso].push(dado.nome);
            }
        });

        let mensagemHTML = '';
        // Itera sobre os processos agrupados
        for (const numProcesso in processos) {
            // Se um processo tem mais de uma pessoa
            if (processos[numProcesso].length > 1) {
                const nomes = processos[numProcesso];
                // Formata os nomes para exibição (ex: "Fulano, Ciclano e Beltrano")
                const nomesFormatados = nomes.map(nome => `<strong>${nome}</strong>`).join(' e ');

                // Cria uma mensagem para este grupo
                mensagemHTML += `<p class="mb-3">Atenção: As seguintes pessoas possuem mandados expedidos pelo mesmo processo <strong>${numProcesso}</strong>:</p>
                                 <p class="mb-3">${nomesFormatados}</p>
                                 <p class="text-muted small">Recomenda-se a verificação de um possível parentesco.</p><hr>`;
            }
        }
        
        // Se alguma mensagem foi gerada, exibe o modal
        if (mensagemHTML) {
            // Remove a última tag <hr> para um visual mais limpo
            if (mensagemHTML.endsWith('<hr>')) {
                mensagemHTML = mensagemHTML.slice(0, -4);
            }
            modalProcessoConteudo.innerHTML = mensagemHTML;
            modalVerificarProcesso.show();
        }
    }
    // FIM: NOVA FUNÇÃO

    async function analisarErenderTodosOsResultados(mostrarSpinner = true) {
        const files = currentManagedFiles;
        if (files.length === 0) {
            resultadosContainer.innerHTML = '';
            tabelaCorpo.innerHTML = '';
            sectionTabela.classList.add('d-none');
            return;
        }
        
        if (mostrarSpinner) {
            btnAnalisarPDF.disabled = true;
            btnAnalisarPDF.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analisando...`;
        }
        
        resultadosContainer.innerHTML = '';
        tabelaCorpo.innerHTML = '';

        let arquivosInvalidos = [];
        let todosOsDados = []; // INÍCIO: Array para armazenar todos os dados extraídos

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const dados = await extractDataFromPDF(file);
            if (dados) {
                todosOsDados.push(dados); // Adiciona os dados ao array
                criarCardResultado(dados, i);
                adicionarLinhaTabela(dados, i);
            } else {
                arquivosInvalidos.push(file.name);
            }
        }
        
        // FIM: Modificação para armazenar dados

        if (tabelaCorpo.children.length > 0) {
            sectionTabela.classList.remove('d-none');
        } else {
            sectionTabela.classList.add('d-none');
        }

        if(arquivosInvalidos.length > 0 && mostrarSpinner) {
            showModalError(`Os seguintes arquivos não puderam ser processados ou não são mandados válidos:<br> - ${arquivosInvalidos.join('<br> - ')}`);
        }
        
        if (mostrarSpinner) {
            const primeiroResultado = resultadosContainer.querySelector('.section-resultado:first-child');
            if (primeiroResultado) {
                primeiroResultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        if (mostrarSpinner) {
            btnAnalisarPDF.disabled = false;
            btnAnalisarPDF.innerHTML = `<i class="bi bi-search me-2"></i> Analisar PDF(s)`;
            verificarProcessosDuplicados(todosOsDados); // INÍCIO: Chama a nova função de verificação
        }

        inicializarTooltips();
    }

    // Event Listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => dragArea.addEventListener(eventName, preventDefaults, false));
    ['dragenter', 'dragover'].forEach(eventName => dragArea.addEventListener(eventName, highlight, false));
    ['dragleave', 'drop'].forEach(eventName => dragArea.addEventListener(eventName, unhighlight, false));
    dragArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files), false);
    
    inputFile.addEventListener('change', (e) => handleFiles(e.target.files));
    fecharPdfBtn.addEventListener('click', resetUI);
    btnLimparSelecaoTabela.addEventListener('click', resetUI); 

    listaArquivosDiv.addEventListener('click', function(e) {
        const closeButton = e.target.closest('.btn-close-file');
        if (closeButton) {
            const fileId = e.target.closest('[data-file-id]').dataset.fileId;
            const file = currentManagedFiles[fileId];
            abrirModalConfirmacao(fileId, file.name);
        }
    });
    
    btnConfirmarExclusao.addEventListener('click', () => {
        if (fileIdParaExcluir !== null) {
            removerArquivoEAnalise(fileIdParaExcluir);
            fileIdParaExcluir = null;
        }
        confirmacaoModal.hide();
    });

    btnAnalisarPDF.addEventListener('click', () => analisarErenderTodosOsResultados(true));

    selectEquipe.addEventListener('change', () => {
        salvarEquipePadrao(selectEquipe.value);
        atualizarTabelaComEquipe();
    });

    function criarCardResultado(data, id) {
        const clone = templateResultado.content.cloneNode(true);
        
        const resultadoSection = clone.querySelector('.section-resultado');
        resultadoSection.dataset.analysisId = id;

        const cardHeader = clone.querySelector('.card-header');
        const collapseTrigger = clone.querySelector('.collapse-trigger');
        const cardTitle = clone.querySelector('.card-title-filename');
        const collapseWrapper = clone.querySelector('.collapse');
        const btnCloseResultCard = clone.querySelector('.btn-close-result-card');
        
        const collapseId = `collapse-body-${id}`;
        collapseWrapper.id = collapseId;
        collapseTrigger.setAttribute('data-bs-target', `#${collapseId}`);
        collapseTrigger.setAttribute('aria-controls', collapseId);
        
        cardTitle.textContent = `Resultado do mandado de ${data.nome}`;

        const chevronIcon = collapseTrigger.querySelector('.collapse-icon');
        const feitoIndicator = document.createElement('span');
        feitoIndicator.className = 'text-success fw-bold me-2 d-none feito-indicator';
        feitoIndicator.innerHTML = `<i class="bi bi-check-circle-fill"></i> Feito`;
        collapseTrigger.insertBefore(feitoIndicator, chevronIcon);

        btnCloseResultCard.addEventListener('click', (e) => {
            abrirModalConfirmacao(id, data.nome);
        });

        const textarea = clone.querySelector('.textarea-resultado');
        const checkFoto = clone.querySelector('.check-foto');
        const labelFoto = clone.querySelector('.form-check-label');
        const uniqueId = `check-foto-${id}`;

        checkFoto.id = uniqueId;
        labelFoto.setAttribute('for', uniqueId);
        
        const contagem = clone.querySelector('.span-contagem');
        const btnCopiarResumo = clone.querySelector('.btn-copiar-resumo');
        
        const rgTexto = data.numRg ? `, RG: ${data.numRg}` : '';
        const cpfTexto = data.numCpf ? `, CPF: ${data.numCpf}` : '';
        const artigoTexto = data.artigo ? `TIP PENAL: ${data.artigo}` : '';
        const condenacaoTexto = (data.condenacao && data.condenacao.trim().toLowerCase() !== 'null') ? `PENA IMPOSTA: ${data.condenacao.trim()}` : '';
        const textoBase = `CONSTA ${data.tipDoc} VIA BNMP CONTRA: ${data.nome}${rgTexto}${cpfTexto}, - MANDADO Nº: ${data.numMandado}, - PROCESSO Nº: ${data.numProcesso}, ${artigoTexto}, - EXPEDIDO EM: ${data.dataExp}, - VÁLIDO ATÉ: ${data.dataValidade}, ${condenacaoTexto} / COPOM CAPTURA.`;
        
        textarea.value = textoBase;
        contagem.textContent = `${textarea.value.length} caracteres`;
        
        textarea.addEventListener('input', () => {
            contagem.textContent = `${textarea.value.length} caracteres`;
        });
        
        checkFoto.addEventListener('change', function() {
            let currentText = textarea.value;
            const textoFoto = ' POSSUI FOTO';
            const textoFinal = ' / COPOM CAPTURA.';
            currentText = currentText.replace(textoFoto, '');

            if (this.checked) {
                currentText = currentText.replace(textoFinal, `${textoFoto}${textoFinal}`);
            }
            textarea.value = currentText;
            contagem.textContent = `${textarea.value.length} caracteres`;
        });
        
        btnCopiarResumo.addEventListener('click', () => {
            navigator.clipboard.writeText(textarea.value.toUpperCase()).then(() => showToast("Resumo copiado!"));
        });
        
        const infoBadgeNome = clone.querySelector('.info-badge-nome');
        const infoBadgeCpf = clone.querySelector('.info-badge-cpf');
        const infoBadgeRg = clone.querySelector('.info-badge-rg');
        const infoBadgeMae = clone.querySelector('.info-badge-mae');

        if (data.nome) {
            infoBadgeNome.querySelector('.info-badge-value').textContent = data.nome;
            infoBadgeNome.classList.remove('d-none');
            infoBadgeNome.addEventListener('click', () => {
                navigator.clipboard.writeText(data.nome).then(() => showToast("Nome copiado!"));
            });
        }

        if (data.numCpf) {
            infoBadgeCpf.querySelector('.info-badge-value').textContent = data.numCpf;
            infoBadgeCpf.classList.remove('d-none');
            infoBadgeCpf.addEventListener('click', () => {
                navigator.clipboard.writeText(data.numCpf.replace(/\D/g, '')).then(() => showToast("CPF copiado!"));
            });
        }

        if (data.numRg) {
            infoBadgeRg.querySelector('.info-badge-value').textContent = data.numRg;
            infoBadgeRg.classList.remove('d-none');
            infoBadgeRg.addEventListener('click', () => {
                navigator.clipboard.writeText(data.numRg).then(() => showToast("RG copiado!"));
            });
        }
        
        if (data.mae) {
            infoBadgeMae.querySelector('.info-badge-value').textContent = data.mae;
            infoBadgeMae.classList.remove('d-none');
            infoBadgeMae.addEventListener('click', () => {
                navigator.clipboard.writeText(data.mae).then(() => showToast("Nome da Mãe copiado!"));
            });
        }

        const btnGerarTalao = clone.querySelector('.btn-feito');
        const cardBody = clone.querySelector('.card-body');

        if (analiseFeitaStatus[id]) {
            cardBody.classList.add('talao-gerado');
            cardHeader.classList.add('header-feito');
            feitoIndicator.classList.remove('d-none');
            btnGerarTalao.innerHTML = `<i class="bi bi-check-circle-fill"></i> Feito`;
            btnGerarTalao.classList.replace('btn-outline-success', 'btn-success');
        }

        btnGerarTalao.addEventListener('click', function() {
            const tableRow = tabelaCorpo.querySelector(`[data-analysis-id="${id}"]`);

            cardBody.classList.toggle('talao-gerado');
            cardHeader.classList.toggle('header-feito');
            feitoIndicator.classList.toggle('d-none');

            if (tableRow) tableRow.classList.toggle('table-success');

            const isFeito = cardBody.classList.contains('talao-gerado');
            analiseFeitaStatus[id] = isFeito;

            if (isFeito) {
                this.innerHTML = `<i class="bi bi-check-circle-fill"></i> Feito`;
                this.classList.replace('btn-outline-success', 'btn-success');
            } else {
                this.innerHTML = `<i class="bi bi-receipt"></i> Feito`;
                this.classList.replace('btn-success', 'btn-outline-success');
            }
        });

        resultadosContainer.appendChild(clone);
    }
    
    function adicionarLinhaTabela(data, id) {
        const row = tabelaCorpo.insertRow();
        row.dataset.analysisId = id;

        row.insertCell(0).textContent = data.nome;
        row.insertCell(1).textContent = data.numRg;
        row.insertCell(2).textContent = data.numCpf;
        
        const artigosSomente = data.artigo.match(/Art\.\:\s*(.+)/);
        row.insertCell(3).textContent = artigosSomente ? artigosSomente[1] : '';
        
        const cellEquipe = row.insertCell(4);
        cellEquipe.textContent = selectEquipe.options[selectEquipe.selectedIndex].text;
        cellEquipe.className = 'fw-bold';

        if (analiseFeitaStatus[id]) {
            row.classList.add('table-success');
        }

        const actionsCell = row.insertCell(5);
        actionsCell.className = 'actions-cell';

        const btnCopyRow = document.createElement('button');
        btnCopyRow.className = 'btn btn-sm btn-outline-primary btn-action';
        btnCopyRow.setAttribute('data-bs-toggle', 'tooltip');
        btnCopyRow.setAttribute('title', 'Copiar Linha');
        btnCopyRow.innerHTML = '<i class="bi bi-clipboard"></i>';
        btnCopyRow.addEventListener('click', () => {
            const colunas = row.querySelectorAll('td');
            const nome = colunas[0].textContent;
            const rg = colunas[1].textContent;
            const cpf = colunas[2].textContent;
            const artigos = colunas[3].textContent;
            
            const equipeAbreviada = selectEquipe.value;
            const textoLinha = `${obterDataHoje()}\t\t\t\t\t${nome}\t${rg}\t${cpf}\t\t${artigos}\t${equipeAbreviada}`;
            
            navigator.clipboard.writeText(textoLinha).then(() => {
                showToast("Linha da tabela copiada!");
            });
        });

        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn btn-sm btn-outline-danger btn-action';
        btnDelete.setAttribute('data-bs-toggle', 'tooltip');
        btnDelete.setAttribute('title', 'Remover Análise');
        btnDelete.innerHTML = '<i class="bi bi-trash3"></i>';
        btnDelete.addEventListener('click', () => {
            abrirModalConfirmacao(id, data.nome);
        });

        actionsCell.append(btnCopyRow, btnDelete);
    }

    document.getElementById('btnCopiarTabela').addEventListener('click', function() {
        let textoCopiado = '';
        const dataHoje = obterDataHoje();
        const linhas = tabelaCorpo.querySelectorAll('tr');
        const equipeAbreviada = selectEquipe.value;
        
        linhas.forEach(linha => {
            const colunas = linha.querySelectorAll('td');
            const nome = colunas[0].textContent;
            const rg = colunas[1].textContent;
            const cpf = colunas[2].textContent;
            const artigos = colunas[3].textContent;
            
            // CORREÇÃO APLICADA AQUI: Removido '()' da variável dataHoje.
            textoCopiado += `${dataHoje}\t\t\t\t\t${nome}\t${rg}\t${cpf}\t\t${artigos}\t${equipeAbreviada}\n`;
        });

        navigator.clipboard.writeText(textoCopiado).then(() => {
            showToast("Dados da tabela copiados para a área de transferência!");
        });
    });

    window.showModalError = showModalError;
});

function showToast(message) {
    const toastElement = document.getElementById('avisoToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}