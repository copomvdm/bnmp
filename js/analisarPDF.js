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
        .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
}

// Função para identificar o tipo de mandado
function identificarTipoMandado(text) {
    const normalizedText = normalizeText(text);

    if (normalizedText.includes('mandado de prisao civil')) {
        return 'mandado de prisão civil';
    } else if (normalizedText.includes('mandado de internacao')) {
        return 'mandado de internação';
    } else if (normalizedText.includes('mandado de recaptura')) {
        return 'mandado de recaptura';
    } else if (normalizedText.includes('mandado de prisao')) {
        return 'mandado de prisão';
    }

    return '';
}

// Função para extrair texto entre duas strings
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

// Função para extrair a Lei e o Artigo
function extractLawAndArticle(text) {
    const match = text.match(/Tipificação Penal:(.*?)Identificação biométrica:/s);
    if (!match) return '';

    const trecho = match[1];
    const leiMatch = trecho.match(/Lei:\s*(\d+)/);
    const lei = leiMatch ? leiMatch[1] : '';
    const artigosEncontrados = [...trecho.matchAll(/Artigo:\s*(\d+\w?)/g)];
    const artigosUnicos = [...new Set(artigosEncontrados.map(m => m[1]))];

    if (lei && artigosUnicos.length > 0) {
        return `Lei: ${lei}, Art.: ${artigosUnicos.join(', ')}`;
    }
    return '';
}

/**
 * Extrai texto e dados de um arquivo PDF e retorna um objeto com as informações.
 * @param {File} pdfFile O arquivo PDF para analisar.
 * @returns {Promise<Object|null>} Uma promessa que resolve para um objeto com os dados ou null se for inválido.
 */
async function extractDataFromPDF(pdfFile) {
    let textoCompleto = '';
    
    try {
        const pdfDoc = await pdfjsLib.getDocument(URL.createObjectURL(pdfFile)).promise;
        const numPages = pdfDoc.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            textoCompleto += pageText + '\n';
        }

        const tipDoc = identificarTipoMandado(textoCompleto);
        if (!tipDoc) {
            console.error(`Arquivo ${pdfFile.name} não parece ser um Mandado do BNMP válido.`);
            return null; // Retorna nulo se não for um mandado válido
        }
        
        const dados = {
            fileName: pdfFile.name,
            nome: '',
            numCpf: '',
            numRg: '',
            numMandado: '',
            numProcesso: '',
            dataExp: '',
            dataValidade: '',
            artigo: '',
            condenacao: '',
            tipDoc: tipDoc
        };

        if (tipDoc === 'mandado de recaptura') {
            dados.nome = extractBetween(textoCompleto, 'Pessoa Procurada:', 'CPF:').trim().toUpperCase();
            dados.numCpf = extractCPF(extractBetween(textoCompleto, 'CPF:', 'Nome Social:')) || '';
            dados.numRg = extractNumbers(extractBetween(textoCompleto, 'RG:', 'Filiação:')) || '';
            dados.numMandado = extractBetween(textoCompleto, 'N° do Documento:', 'Data de validade:') || '';
            dados.numProcesso = extractBetween(textoCompleto, 'Nº do processo:', 'Órgão Judicial:') || '';
            dados.dataExp = extractDate(extractBetween(textoCompleto, 'Documento gerado em:', '\n')) || '';
            dados.dataValidade = extractBetween(textoCompleto, 'Data de validade:', 'Pessoa Procurada:')?.trim() || '';
            dados.artigo = extractLawAndArticle(textoCompleto);
            dados.condenacao = extractBetween(textoCompleto, 'Pena restante:', 'Regime Prisional:') || '';
        } else {
            dados.nome = extractBetween(textoCompleto, 'Nome da Pessoa:', 'CPF:').trim().toUpperCase();
            dados.numCpf = extractCPF(extractBetween(textoCompleto, 'CPF:', 'Teor do Documento')) || '';
            dados.numRg = extractNumbers(extractBetween(textoCompleto, 'RG:', 'Filiação:')) || '';
            dados.numMandado = extractBetween(textoCompleto, 'N° do Mandado:', 'Data de validade:') || extractBetween(textoCompleto, 'Nº do Mandado:', 'Data de validade:');
            dados.numProcesso = extractBetween(textoCompleto, 'Nº do processo:', 'Órgão Judicial:') || extractBetween(textoCompleto, 'N° do processo:', 'Órgão Judicial:');
            dados.dataExp = extractDate(extractBetween(textoCompleto, 'Documento criado em:', '\n'));
            dados.dataValidade = extractDate(extractBetween(textoCompleto, 'Data de validade:', 'Nome Social:'));
            dados.artigo = extractLawAndArticle(textoCompleto);
            dados.condenacao = extractBetween(textoCompleto, 'Pena restante:', 'Regime Prisional:') || '';
        }
        
        return dados;

    } catch (error) {
        console.error(`Erro ao processar o arquivo ${pdfFile.name}:`, error);
        return null; // Retorna nulo em caso de erro na biblioteca PDF.js
    }
}