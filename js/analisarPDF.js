// Declaração global de numCpf e numRg
let numCpf = '';
let numRg = '';
let nome = '';

// Função para obter a data de hoje no formato dd/mm/aaaa
function obterDataHoje() {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Função para remover acentos e normalizar o texto
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');  // Remove acentos
}

// Função para identificar o tipo de mandado
function identificarTipoMandado(text) {
    const normalizedText = normalizeText(text);

    if (normalizedText.includes('mandado de prisao civil')) {
        return 'mandado de prisão civil';
    } else if (normalizedText.includes('mandado de internacao')) {
        return 'mandado de internação';
    } else if (normalizedText.includes('mandado de prisao')) {
        return 'mandado de prisão';
    }

    return ''; 
}

// Função corrigida para extrair o nome corretamente
function extractBetween(text, startText, endText) {
    const startIndex = text.indexOf(startText);
    if (startIndex === -1) return '';  
    
    const actualStartIndex = startIndex + startText.length;
    const endIndex = text.indexOf(endText, actualStartIndex);

    if (endIndex === -1) return '';  

    return text.slice(actualStartIndex, endIndex).trim();
}

// Função para extrair apenas números de um texto
function extractNumbers(text) {
    return text.replace(/\D/g, '');
}

// Função para extrair CPF (formato específico)
function extractCPF(text) {
    const match = text.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    return match ? match[0] : '';  
}

// Função para extrair datas no formato dd/mm/aaaa
function extractDate(text) {
    const match = text.match(/\d{2}\/\d{2}\/\d{4}/);
    return match ? match[0] : '';
}

// Função para extrair os artigos da lei (somente os números) sem duplicatas
function extractArticles(text) {
    const matches = text.match(/art\.\s*(\d+)/g);
    if (!matches) return '';  // Se não houver artigos, retorna vazio

    // Remove duplicatas usando Set
    const articles = [...new Set(matches.map(match => match.replace(/art\.\s*/, '').trim()))];
    return articles.join(' / ');
}


// Função para extrair texto do PDF usando a biblioteca pdf.js
async function extractTextFromPDF(pdf) {
    let textoCompleto = ''; 

    const pdfDoc = await pdfjsLib.getDocument(URL.createObjectURL(pdf)).promise;
    const numPages = pdfDoc.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items.map(item => item.str).join(' ');
        textoCompleto += pageText + '\n'; 
    }

    console.log(textoCompleto);  

    let tipDoc = '';
    let filiacao = '';
    let numMandado = '';
    let numProcesso = '';
    let numRJI = '';
    let dataExp = '';
    let dataValidade = '';
    let artigo = '';
    let condenacao = '';
    let possuiFoto = '';

    tipDoc = identificarTipoMandado(textoCompleto);
    
    if (tipDoc) {
        nome = extractBetween(textoCompleto, 'Nome da Pessoa:', 'CPF:').trim().toUpperCase();
        filiacao = extractBetween(textoCompleto, 'Filiação:', 'Marcas e sinais:');
        numCpf = extractCPF(extractBetween(textoCompleto, 'CPF:', 'Teor do Documento')) || '';
        numRg = extractNumbers(extractBetween(textoCompleto, 'RG:', 'Filiação:')) || '';
        numMandado = extractBetween(textoCompleto, 'N° do Mandado:', 'Data de validade:') || 
                     extractBetween(textoCompleto, 'Nº do Mandado:', 'Data de validade:');
        numProcesso = extractBetween(textoCompleto, 'Nº do processo:', 'Órgão Judicial:') || 
                      extractBetween(textoCompleto, 'N° do processo:', 'Órgão Judicial:');
        numRJI = extractBetween(textoCompleto, 'RJI:', 'Alcunha:');
        dataExp = extractDate(extractBetween(textoCompleto, 'Documento gerado em:', '\n'));
        dataValidade = extractDate(extractBetween(textoCompleto, 'Data de validade:', 'Nome Social:'));
        artigo = extractArticles(textoCompleto);  // Extrai os números dos artigos da lei
        condenacao = extractBetween(textoCompleto, 'Condenação:', 'Regime Prisional:');
        possuiFoto = document.getElementById('checkPossuiFotoPDF').checked ? 'POSSUI FOTO' : '';

        // Atualiza a tabela com os dados extraídos
        atualizarTabela(nome, numRg, numCpf, artigo);
    } else {
        showModalError("O arquivo não é um Mandado de Prisão, Internação ou Prisão Civil.");
        resetPDFState();  
        return;
    }

    console.log({
        tipDoc,
        nome,
        filiacao,
        numCpf,
        numRg,
        numMandado,
        numProcesso,
        numRJI,
        dataExp,
        dataValidade,
        artigo,
        condenacao,
        possuiFoto
    });

    let artigoTexto = artigo ? `TIP PENAL: art. ${artigo}` : '';
    let condenacaoTexto = (condenacao && condenacao.trim().toLowerCase() !== 'null') ? `CONDENAÇÃO: ${condenacao}` : '';

    document.getElementById('textareaResultado').value = `CONSTA ${tipDoc} VIA BNMP CONTRA: ${nome}, RG: ${numRg}, CPF: ${numCpf}, - MANDADO Nº: ${numMandado}, - PROCESSO Nº: ${numProcesso}, ${artigoTexto}, - EXPEDIDO EM: ${dataExp}, - VÁLIDO ATÉ: ${dataValidade}, ${condenacaoTexto} ${possuiFoto} / COPOM CAPTURA.`;

    // Chama a função para atualizar a contagem de caracteres
    atualizarContagemCaracteres();
}

// Função para preencher a tabela com os dados extraídos
function atualizarTabela(nome, rg, cpf, artigos) {
    const dataHoje = obterDataHoje();  // Obtém a data de hoje

    // Estrutura da tabela a ser copiada, incluindo 5 campos vazios e "B"
    const textoCopiado = `${dataHoje}\t\t\t\t\t${nome}\t${rg}\t${cpf}\t\t${artigos}\tB`;

    // Atualiza as células da tabela
    document.getElementById('nome-tabela').textContent = nome || '';
    document.getElementById('rg-tabela').textContent = rg || '';
    document.getElementById('cpf-tabela').textContent = cpf || '';
    document.getElementById('artigos-tabela').textContent = artigos || '';

    // Exibe a tabela
    const sectionTabela = document.getElementById('section-tabela');
    sectionTabela.classList.remove('d-none');
}

// Função para copiar a tabela
document.getElementById('btnCopiarTabela').addEventListener('click', function() {
    const nome = document.getElementById('nome-tabela').textContent;
    const rg = document.getElementById('rg-tabela').textContent;
    const cpf = document.getElementById('cpf-tabela').textContent;
    const artigos = document.getElementById('artigos-tabela').textContent;
    const dataHoje = obterDataHoje();

    // Adiciona os 5 campos vazios e o campo "B" no final
    const textoCopiado = `${dataHoje}\t\t\t\t\t${nome}\t${rg}\t${cpf}\t\t${artigos}\tB`;

    const tempInput = document.createElement('textarea');
    tempInput.value = textoCopiado;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Exibe um aviso flutuante de sucesso
    mostrarAvisoFlutuante("Tabela copiada!");
});

// Evento de clique para o botão "Analisar PDF"
document.getElementById('btnAnalisarPDF').addEventListener('click', function () {
    console.clear();  

    const inputFile = document.getElementById('input-file');
    const file = inputFile.files[0];  

    if (file && file.type === "application/pdf") {
        extractTextFromPDF(file);  // Extrai o texto do PDF

        // Exibe a seção de resultados ao analisar o PDF
        const sectionResultado = document.getElementById('section-resultado');
        sectionResultado.classList.remove('d-none'); // Remove a classe d-none para exibir a seção

        // Rola a página para a section de resultado
        sectionResultado.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Faz o scroll suave até a section
    } else {
        console.error("Nenhum arquivo PDF foi carregado.");
    }
});

// Função para resetar o estado do PDF
function resetPDFState() {
    const fileInput = document.getElementById('input-file');
    const nomePdfSpan = document.getElementById('nome-pdf');
    const infoPdfDiv = document.getElementById('info-pdf');
    const btnAnalisarPDF = document.getElementById('btnAnalisarPDF');
    const possuiFotoPDF = document.getElementById('possuiFotoPDF');
    const divCarregarPDF = document.getElementById('div-carregarPDF');
    const textareaResultado = document.getElementById('textareaResultado');  

    fileInput.value = '';
    nomePdfSpan.textContent = "Nenhum ficheiro selecionado";
    infoPdfDiv.classList.add('d-none');
    btnAnalisarPDF.classList.add('d-none');
    possuiFotoPDF.classList.add('d-none');
    divCarregarPDF.classList.remove('d-none'); 
    textareaResultado.value = '';  
    console.clear();
}

// Função para atualizar a contagem de caracteres do textarea
function atualizarContagemCaracteres() {
    const textarea = document.getElementById('textareaResultado');
    const spanContagem = document.getElementById('spanContagemCaracteresResultado');
    const contagemCaracteres = textarea.value.length;

    // Atualiza o texto do span com a contagem de caracteres
    spanContagem.textContent = `${contagemCaracteres} caracteres`;
}

// Adiciona um evento input ao textarea para atualizar a contagem dinamicamente
document.getElementById('textareaResultado').addEventListener('input', atualizarContagemCaracteres);

// Função para mostrar o aviso flutuante
function mostrarAvisoFlutuante(mensagem) {
    const avisoFlutuante = document.getElementById('avisoFlutuante');
    avisoFlutuante.textContent = mensagem;
    avisoFlutuante.classList.remove('d-none');
    setTimeout(() => {
        avisoFlutuante.classList.add('d-none');
    }, 2000);
}

// Função para copiar o CPF para a área de transferência sem pontos e traços
document.getElementById('btnCopiarCPF').addEventListener('click', function() {
    if (numCpf) {
        const cpfLimpo = numCpf.replace(/[.-]/g, '');
        navigator.clipboard.writeText(cpfLimpo).then(function() {
            mostrarAvisoFlutuante("CPF copiado!");
        }).catch(function(error) {
            console.error('Erro ao copiar CPF: ', error);
        });
    } else {
        console.error('CPF não encontrado.');
    }
});

// Função para copiar o resultado do textarea
document.getElementById('btnCopiarResultado').addEventListener('click', function () {
    const textarea = document.getElementById('textareaResultado');
    
    navigator.clipboard.writeText(textarea.value.toUpperCase()).then(function () {
        mostrarAvisoFlutuante("Texto copiado!");
    }).catch(function (error) {
        console.error('Erro ao copiar texto: ', error);
    });
});

// Função para copiar o RG para a área de transferência, somente se for apenas números
document.getElementById('btnCopiarRG').addEventListener('click', function() {
    if (numRg && /^\d+$/.test(numRg)) {
        navigator.clipboard.writeText(numRg).then(function() {
            mostrarAvisoFlutuante("RG copiado!");
        }).catch(function(error) {
            console.error('Erro ao copiar RG: ', error);
        });
    } else {
        console.error('RG inválido ou não encontrado.');
        mostrarAvisoFlutuante("RG inválido!");
    }
});

// Função para copiar o nome para a área de transferência
document.getElementById('btnCopiarNome').addEventListener('click', function() {
    if (nome) {  
        navigator.clipboard.writeText(nome).then(function() {
            mostrarAvisoFlutuante("Nome copiado!");  
        }).catch(function(error) {
            console.error('Erro ao copiar nome: ', error);
        });
    } else {
        console.error('Nome não encontrado.');
    }
});
