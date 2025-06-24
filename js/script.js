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

    // Modais
    const modalVerificarProcessoEl = document.getElementById('modalVerificarProcesso');
    const modalVerificarProcesso = new bootstrap.Modal(modalVerificarProcessoEl);
    const modalProcessoConteudo = document.getElementById('modal-processo-conteudo');
    const modalVerificarMaeEl = document.getElementById('modalVerificarMae'); // Novo modal
    const modalVerificarMae = new bootstrap.Modal(modalVerificarMaeEl);     // Novo modal
    const modalMaeConteudo = document.getElementById('modal-mae-conteudo'); // Novo modal

    // Variáveis de estado
    let currentManagedFiles = [];
    let currentAnalysisData = [];
    const MAX_FILES = 10;
    let fileIdParaExcluir = null;
    const EQUIPE_STORAGE_KEY = 'equipePadrao';
    let analiseFeitaStatus = {}; 
    
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
        currentAnalysisData = [];
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
        const scrollY = window.scrollY;
        const idToRemove = parseInt(fileId, 10);
    
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
        currentAnalysisData.splice(idToRemove, 1);
    
        if (currentManagedFiles.length === 0) {
            resetUI();
            return;
        }
    
        updateFileUI();
        
        await analisarErenderTodosOsResultados(false); 
    
        window.scrollTo({ top: scrollY, behavior: 'instant' });
    }

    function verificarProcessosDuplicados(todosOsDados, mostrarModal) {
        document.querySelectorAll('.processo-duplicado-icon, .processo-duplicado-icon-tabela').forEach(icon => icon.classList.add('d-none'));

        const processos = {};
        todosOsDados.forEach((dado, index) => {
            if (dado.numProcesso) {
                if (!processos[dado.numProcesso]) {
                    processos[dado.numProcesso] = [];
                }
                processos[dado.numProcesso].push({ nome: dado.nome, id: index });
            }
        });

        let mensagemHTML = '';
        for (const numProcesso in processos) {
            const membros = processos[numProcesso];
            if (membros.length > 1) {
                const nomes = membros.map(m => m.nome);
                const nomesFormatados = nomes.map(nome => `<strong>${nome}</strong>`).join(' e ');
                mensagemHTML += `<p class="mb-3">Atenção: As seguintes pessoas possuem mandados expedidos pelo mesmo processo <strong>${numProcesso}</strong>:</p><p class="mb-3">${nomesFormatados}</p><hr>`;
                membros.forEach(membro => {
                    const cardElement = document.querySelector(`.section-resultado[data-analysis-id="${membro.id}"]`);
                    if (cardElement) cardElement.querySelector('.processo-duplicado-icon')?.classList.remove('d-none');
                    const tableRowElement = document.querySelector(`#tabela-corpo tr[data-analysis-id="${membro.id}"]`);
                    if (tableRowElement) tableRowElement.querySelector('.processo-duplicado-icon-tabela')?.classList.remove('d-none');
                });
            }
        }
        
        if (mostrarModal && mensagemHTML) {
            if (mensagemHTML.endsWith('<hr>')) mensagemHTML = mensagemHTML.slice(0, -4);
            modalProcessoConteudo.innerHTML = mensagemHTML;
            modalVerificarProcesso.show();
        }
    }

    // NOVA FUNÇÃO para verificar mães duplicadas
    function verificarMaesDuplicadas(todosOsDados, mostrarModal) {
        document.querySelectorAll('.mae-duplicada-icon, .mae-duplicada-icon-tabela').forEach(icon => icon.classList.add('d-none'));

        const maes = {};
        todosOsDados.forEach((dado, index) => {
            // Verifica se o nome da mãe existe e não é um valor genérico
            if (dado.mae && dado.mae !== 'NAO INFORMADO' && dado.mae.length > 5) {
                if (!maes[dado.mae]) {
                    maes[dado.mae] = [];
                }
                maes[dado.mae].push({ nome: dado.nome, id: index });
            }
        });

        let mensagemHTML = '';
        for (const nomeMae in maes) {
            const membros = maes[nomeMae];
            if (membros.length > 1) {
                const nomes = membros.map(m => m.nome);
                const nomesFormatados = nomes.map(nome => `<strong>${nome}</strong>`).join(' e ');
                mensagemHTML += `<p class="mb-3">Atenção: As seguintes pessoas parecem ser parentes, pois possuem a mesma mãe (<strong>${nomeMae}</strong>):</p><p class="mb-3">${nomesFormatados}</p><p class="text-muted small">Recomenda-se a verificação de um possível parentesco.</p><hr>`;
                membros.forEach(membro => {
                    const cardElement = document.querySelector(`.section-resultado[data-analysis-id="${membro.id}"]`);
                    if (cardElement) cardElement.querySelector('.mae-duplicada-icon')?.classList.remove('d-none');
                    const tableRowElement = document.querySelector(`#tabela-corpo tr[data-analysis-id="${membro.id}"]`);
                    if (tableRowElement) tableRowElement.querySelector('.mae-duplicada-icon-tabela')?.classList.remove('d-none');
                });
            }
        }
        
        if (mostrarModal && mensagemHTML) {
            if (mensagemHTML.endsWith('<hr>')) mensagemHTML = mensagemHTML.slice(0, -4);
            modalMaeConteudo.innerHTML = mensagemHTML;
            modalVerificarMae.show();
        }
    }

    async function analisarErenderTodosOsResultados(fazerAnaliseCompleta = true) {
        resultadosContainer.innerHTML = '';
        tabelaCorpo.innerHTML = '';

        if (fazerAnaliseCompleta) {
            btnAnalisarPDF.disabled = true;
            btnAnalisarPDF.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analisando...`;
            
            currentAnalysisData = [];
            let arquivosInvalidos = [];

            for (const file of currentManagedFiles) {
                const dados = await extractDataFromPDF(file);
                if (dados) {
                    currentAnalysisData.push(dados);
                } else {
                    arquivosInvalidos.push(file.name);
                }
            }

            if (arquivosInvalidos.length > 0) {
                showModalError(`Os seguintes arquivos não puderam ser processados ou não são mandados válidos:<br> - ${arquivosInvalidos.join('<br> - ')}`);
            }
        }

        if (currentAnalysisData.length === 0) {
            sectionTabela.classList.add('d-none');
            if (fazerAnaliseCompleta) {
                btnAnalisarPDF.disabled = false;
                btnAnalisarPDF.innerHTML = `<i class="bi bi-search me-2"></i> Analisar PDF(s)`;
            }
            return;
        }

        currentAnalysisData.forEach((dados, index) => {
            criarCardResultado(dados, index);
            adicionarLinhaTabela(dados, index);
        });

        sectionTabela.classList.remove('d-none');

        if (fazerAnaliseCompleta) {
            const primeiroResultado = resultadosContainer.querySelector('.section-resultado:first-child');
            if (primeiroResultado) {
                primeiroResultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            btnAnalisarPDF.disabled = false;
            btnAnalisarPDF.innerHTML = `<i class="bi bi-search me-2"></i> Analisar PDF(s)`;
        }
        
        // Executa AMBAS as verificações
        verificarProcessosDuplicados(currentAnalysisData, fazerAnaliseCompleta);
        verificarMaesDuplicadas(currentAnalysisData, fazerAnaliseCompleta);

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
            abrirModalConfirmacao(fileId, currentManagedFiles[fileId]?.name);
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

        // --- INÍCIO DA MODIFICAÇÃO ---
        const editableDiv = clone.querySelector('.textarea-resultado');
        const checkFoto = clone.querySelector('.check-foto');
        const labelFoto = clone.querySelector('.form-check-label');
        const uniqueId = `check-foto-${id}`;

        checkFoto.id = uniqueId;
        labelFoto.setAttribute('for', uniqueId);
        
        const contagem = clone.querySelector('.span-contagem');
        const btnCopiarResumo = clone.querySelector('.btn-copiar-resumo');
        
        const rgTexto = data.numRg ? `, <strong>RG:</strong> ${data.numRg}` : '';
        const cpfTexto = data.numCpf ? `, <strong>CPF:</strong> ${data.numCpf}` : '';
        const artigoTexto = data.artigo ? `<strong>TIP PENAL:</strong> ${data.artigo.replace('Art.:', '<strong>Art.:</strong>')}` : '';
        const condenacaoTexto = (data.condenacao && data.condenacao.trim().toLowerCase() !== 'null') ? `PENA IMPOSTA: ${data.condenacao.trim()}` : '';
        const textoBase = `CONSTA ${data.tipDoc} VIA BNMP <strong>CONTRA:</strong> ${data.nome}${rgTexto}${cpfTexto}, - <strong>MANDADO Nº:</strong> ${data.numMandado}, - <strong>PROCESSO Nº:</strong> ${data.numProcesso}, ${artigoTexto}, - <strong>EXPEDIDO EM:</strong> ${data.dataExp}, - <strong>VÁLIDO ATÉ:</strong> ${data.dataValidade}, ${condenacaoTexto} / COPOM CAPTURA.`;
        
        editableDiv.innerHTML = textoBase;
        contagem.textContent = `${editableDiv.innerText.length} caracteres`;
        
        editableDiv.addEventListener('input', () => {
            contagem.textContent = `${editableDiv.innerText.length} caracteres`;
        });
        
        checkFoto.addEventListener('change', function() {
            let currentHtml = editableDiv.innerHTML;
            const textoFoto = ' POSSUI FOTO';
            const textoFinal = ' / COPOM CAPTURA.';
            
            // Remove a marcação de foto para evitar duplicação
            currentHtml = currentHtml.replace(textoFoto, '');

            if (this.checked) {
                // Insere a marcação de foto antes do final
                currentHtml = currentHtml.replace(textoFinal, `${textoFoto}${textoFinal}`);
            }
            editableDiv.innerHTML = currentHtml;
            contagem.textContent = `${editableDiv.innerText.length} caracteres`;
        });
        
        btnCopiarResumo.addEventListener('click', () => {
            // Copia o texto visível (sem as tags HTML)
            navigator.clipboard.writeText(editableDiv.innerText.toUpperCase()).then(() => showToast("Resumo copiado!"));
        });
        // --- FIM DA MODIFICAÇÃO ---
        
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
    
    // ATUALIZADO: Inclui placeholders para ambos os ícones
    function adicionarLinhaTabela(data, id) {
        const row = tabelaCorpo.insertRow();
        row.dataset.analysisId = id;

        const cellNome = row.insertCell(0);
        cellNome.innerHTML = `
            <span class="processo-duplicado-icon-tabela d-none" data-bs-toggle="tooltip" title="Este mandado possui o mesmo nº de processo de outro na lista."><i class="bi bi-link-45deg"></i></span>
            <span class="mae-duplicada-icon-tabela d-none" data-bs-toggle="tooltip" title="Esta pessoa parece ter a mesma mãe de outra na lista."><i class="bi bi-people-fill"></i></span>
            <span>${data.nome}</span>
        `;

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
            const nome = colunas[0].textContent.trim();
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
            const nome = colunas[0].textContent.trim();
            const rg = colunas[1].textContent;
            const cpf = colunas[2].textContent;
            const artigos = colunas[3].textContent;
            
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