(function () {
    const elementos = {
        lblInputFile: document.getElementById('lbl-input-file'),
        inputFile: document.getElementById('input-file'),
        nomePDF: document.getElementById('nome-pdf'),
        btnExcluirPDF: document.getElementById('btnExcluirPDF'),
        infoPDF: document.getElementById('info-pdf'),
        btnAnalisarPDF: document.getElementById('btnAnalisarPDF'),
        divPossuiFotoPDF: document.getElementById('divPossuiFotoPDF'),
        divTextAreaTXT: document.getElementById('divTextAreaTXT'),
        divPDF: document.getElementById('divPDF'),
        checkPossuiFotoPDF: document.getElementById('checkPossuiFotoPDF'),
        spanContagemCaracteresTXT: document.getElementById('spanContagemCaracteresTXT'),
        spanContagemCaracteresResultado: document.getElementById('spanContagemCaracteresResultado'),
        textareaTXT: document.getElementById('textareaTXT'),
        textareaResultado: document.getElementById('textareaResultado'),
        btnLimparTXT: document.getElementById('btnLimparTXT'),
        checkPossuiFotoTXT: document.getElementById('checkPossuiFotoTXT'),
        btnAnalisarPDF: document.getElementById('btnAnalisarPDF'),
        btnCopiarResultado: document.getElementById('btnCopiarResultado'),
        btnCopiarCPF: document.getElementById('btnCopiarCPF'),
        btnCopiarRG: document.getElementById('btnCopiarRG'),
        btnCopiarNome: document.getElementById('btnCopiarNome'),  // Adicionado para copiar nome
        bntAnalisarTXT: document.getElementById('bntAnalisarTXT')
    };

    // Definir o caminho para o script do worker do PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.min.js';

    // Adicionando ouvinte de evento click para o botão de Analisar Texto
    if (elementos.bntAnalisarTXT) {
        elementos.bntAnalisarTXT.addEventListener('click', analisarTextoInicial);
    } else {
        console.error('Botão de Analisar Texto não encontrado');
    }

    // Adicionando ouvinte de evento click para o botão de Analisar PDF
    if (elementos.btnAnalisarPDF) {
        elementos.btnAnalisarPDF.addEventListener('click', analisarTextoPDF);
    } else {
        console.error('Botão de Analisar PDF não encontrado.')
    }

    // Adicionando ouvinte de evento click para o botão de Copiar texto Resultado
    if (elementos.btnCopiarResultado) {
        elementos.btnCopiarResultado.addEventListener('click', copiarTextoResultado);
    } else {
        console.error('Botão de Copiar Resultado não encontrado.')
    }

    // Adicionando ouvinte de evento click para o botão de Copiar CPF
    if (elementos.btnCopiarCPF) {
        elementos.btnCopiarCPF.addEventListener('click', copiarCPF);
    } else {
        console.error('Botão de Copiar CPF não encontrado.')
    }

    // Adicionando ouvinte de evento click para o botão de Copiar RG
    if (elementos.btnCopiarRG) {
        elementos.btnCopiarRG.addEventListener('click', copiarRG);
    } else {
        console.error('Botão de Copiar RG não encontrado.')
    }

    // Adicionando ouvinte de evento click para o botão de Copiar Nome
    if (elementos.btnCopiarNome) {
        elementos.btnCopiarNome.addEventListener('click', copiarNome);
    } else {
        console.error('Botão de Copiar Nome não encontrado.')
    }

    // Adicionando ouvinte de evento para o textarea Resultado
    if (elementos.textareaResultado) {
        elementos.textareaResultado.addEventListener('input', function () {
            atualizarContagemCaracteres();
        });
    }

    // Adicionando ouvinte de evento para o textarea TXT
    if (elementos.textareaTXT) {
        elementos.textareaTXT.addEventListener('input', function () {
            atualizarContagemCaracteres();
        });
    }

    // Adicionando ouvinte de evento para o botão Botão Limpar Texto (btnLimparTXT)
    if (elementos.btnLimparTXT) {
        elementos.btnLimparTXT.addEventListener('click', btnLimparTexto);
    } else {
        console.error('Botão de Limpar Texto não encontrado.');
    }

    // Adicionando ouvinte de evento para o botão de exclusão
    if (elementos.btnExcluirPDF) {
        elementos.btnExcluirPDF.addEventListener('click', excluirPDF);
    } else {
        console.error('Botão de exclusão não encontrado.');
    }

    // Adicionando ouvinte de evento para o input file
    if (elementos.inputFile) {
        elementos.inputFile.addEventListener('change', carregarPDF);
    } else {
        console.error('Elemento input-file não encontrado.');
    }

    ocultarItens();

    function carregarPDF() {
        const { files } = elementos.inputFile;
        if (files.length > 0) {
            const fileName = files[0].name;
            if (!fileName.endsWith('.pdf')) {
                limparInput();
                exibirMensagemErro('Selecione apenas arquivos com extensão .pdf');
                return;
            }
            elementos.nomePDF.textContent = fileName;
        } else {
            elementos.nomePDF.textContent = 'Nenhum ficheiro selecionado';
        }

        elementos.infoPDF.style.display = 'flex';
        elementos.lblInputFile.style.display = 'none';

        if (elementos.btnAnalisarPDF) {
            elementos.btnAnalisarPDF.style.display = 'flex';
        } else {
            console.error("Botão Analisar PDF não encontrado");
        }

        if (elementos.divPossuiFotoPDF) {
            elementos.divPossuiFotoPDF.style.display = 'block';
        } else {
            console.error("Div Possui foto não encontrada");
        }

        if (elementos.divTextAreaTXT) {
            elementos.divTextAreaTXT.style.display = 'none';
        } else {
            console.error('Div textarea TXT não encontrada')
        }

        mudarEstiloDivPDF();
        limparTextarea();
    }

    function limparInput() {
        if (elementos.inputFile) {
            elementos.inputFile.value = '';
        }
    }

    function excluirPDF() {
        limparInput();
        elementos.nomePDF.textContent = 'Nenhum ficheiro selecionado';
        elementos.infoPDF.style.display = 'none';
        elementos.lblInputFile.style.display = 'flex';

        if (elementos.btnAnalisarPDF) {
            elementos.btnAnalisarPDF.style.display = 'none';
        } else {
            console.error("Botão Analisar PDF não encontrado");
        }

        if (elementos.divPossuiFotoPDF) {
            elementos.divPossuiFotoPDF.style.display = 'none';
        } else {
            console.error("Div Possui foto não encontrada");
        }

        if (elementos.divTextAreaTXT) {
            elementos.divTextAreaTXT.style.display = 'flex';
        } else {
            console.error('Div textarea TXT não encontrada')
        }
        // Se o checkbox Possui foto PDF estiver checado, retire o checado.
        if (elementos.checkPossuiFotoPDF) {
            if (elementos.checkPossuiFotoPDF.checked) {
                elementos.checkPossuiFotoPDF.checked = false;
            }
        }

        limparTextarea();
        restaurarEstiloDivPDF();
        atualizarContagemCaracteres();
        console.clear();
    }

    function exibirMensagemErro(mensagem) {
        alert(mensagem);
    }

    function ocultarItens() {
        if (elementos.inputFile) {
            elementos.inputFile.style.display = 'none';
        } else {
            console.error("Input do tipo file não encontrado");
        }

        if (elementos.divPossuiFotoPDF) {
            divPossuiFotoPDF.style.display = 'none';
        }
    }

    function mudarEstiloDivPDF() {
        if (elementos.divPDF) {
            const estiloDivPDF = elementos.divPDF.style;
            estiloDivPDF.border = '2px solid green';
            estiloDivPDF.borderRadius = '5px';
            estiloDivPDF.backgroundColor = '#b5dab5';
        } else {
            console.error("Div PDF não encontrada");
        }
    }

    function restaurarEstiloDivPDF() {
        if (elementos.divPDF) {
            const estiloDivPDF = elementos.divPDF.style;
            estiloDivPDF.border = '2px dashed #333';
            estiloDivPDF.borderRadius = '';
            estiloDivPDF.backgroundColor = '';
        } else {
            console.error("Div PDF não encontrada");
        }
    }

    function atualizarContagemCaracteres() {
        if (elementos.textareaTXT) {
            const numCaracteresTXT = elementos.textareaTXT.value.length;
            elementos.spanContagemCaracteresTXT.textContent = numCaracteresTXT + ' caracteres';
        }

        if (elementos.textareaResultado) {
            const numCaracteresResultado = elementos.textareaResultado.value.length;
            elementos.spanContagemCaracteresResultado.textContent = numCaracteresResultado + ' caracteres';
        }
    }

    function limparTextarea() {
        // Limpar o conteúdo do textarea TXT
        if (elementos.textareaTXT.value.length > 0) {
            elementos.textareaTXT.value = '';
        }
        // Limpar o conteúdo do textarea Resultado
        if (elementos.textareaResultado.value.length > 0) {
            elementos.textareaResultado.value = '';
        }
        atualizarContagemCaracteres();
    }

    function btnLimparTexto() {
        limparTextarea();
        elementos.textareaTXT.focus();

        // Se o checkbox Possui foto PDF estiver checado, retire o checado.
        if (elementos.checkPossuiFotoPDF) {
            if (elementos.checkPossuiFotoPDF.checked) {
                elementos.checkPossuiFotoPDF.checked = false;
            }
        }

        if (elementos.checkPossuiFotoTXT) {
            if (elementos.checkPossuiFotoTXT.checked) {
                elementos.checkPossuiFotoTXT.checked = false;
            }
        }
    }

    async function analisarTextoPDF() {
        console.clear();
        var possuiFoto = false;

        // Verificar se o checkbox está marcado
        var checkbox = document.getElementById('checkPossuiFotoPDF');
        if (checkbox.checked) {
            possuiFoto = true;
        }

        const textoPDF = elementos.inputFile.files[0];
        if (textoPDF) {
            const fileReader = new FileReader();
            fileReader.onload = async function () {
                const typedarray = new Uint8Array(this.result);
                // Carregando o PDF usando o PDF.js
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const numPages = pdf.numPages;
                let textoCompleto = '';
                // Iterando sobre todas as páginas do PDF
                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    // Extraindo o texto da página
                    const textContent = await page.getTextContent();
                    const textItems = textContent.items;
                    // Concatenando todos os itens de texto da página
                    textItems.forEach(function (item) {
                        // Verificando se o item não é uma imagem
                        if (item.type !== 'image') {
                            textoCompleto += item.str + ' ';
                        }
                    });
                }
                // Realizar a análise do texto completo, verificando o tipo de documento
                var tipoDoc = textoCompleto.match(/^(.*?)(?=Nº do Mandado|N° do Mandado)/);
                if (tipoDoc && tipoDoc[0].trim() !== '') {
                    console.log(textoCompleto);
                    analisarTextoCompleto(textoCompleto, possuiFoto);
                } else {
                    alert('O Documento não é um Mandado de Prisão ou Mandado de Internação. Por favor, verifique o documento!');
                    excluirPDF();
                }
            };
            fileReader.readAsArrayBuffer(textoPDF);
        } else {
            console.error('Nenhum arquivo PDF selecionado.');
        }
    }

    async function analisarTextoCompleto(textoCompleto) {
        // Tipo de Documento (MANDADO DE PRISÃO ou MANDADO DE INTERNAÇÃO)
        var tipoDoc = textoCompleto.includes('MANDADO DE PRISÃO') ? 'MANDADO DE PRISÃO' :
            textoCompleto.includes('MANDADO DE INTERNAÇÃO') ? 'MANDADO DE INTERNAÇÃO' : 'Tipo Desconhecido';

        // Nome da Pessoa
        var nome = textoCompleto.match(/Nome da Pessoa:\s*([^\n]+)\s*CPF:/i);
        nome = nome ? nome[1].trim() : 'Nome não encontrado';

        // CPF
        var cpf = textoCompleto.match(/CPF:\s*([^\n]+)\s*Teor do Documento:/i);
        cpf = cpf ? cpf[1].trim() : 'CPF não encontrado';

        // RG
        var rg = textoCompleto.match(/RG:\s*([^\n]+)\s*Filiação:/i);
        rg = rg ? rg[1].trim() : 'Não Informado';

        // Número do Mandado até antes de "Data de validade"
        var nMandado = textoCompleto.match(/N[º°] do Mandado:\s*([^\n]+?)\s*(?=Data de validade)/i);
        nMandado = nMandado ? nMandado[1].trim() : 'Mandado não encontrado';


        // Data de Validade
        var dataValidade = textoCompleto.match(/Data de validade:\s*([^\n]+)\s*Nome Social:/i);
        dataValidade = dataValidade ? dataValidade[1].trim() : 'Data de validade não encontrada';

        // Número do Processo
        var nProcesso = textoCompleto.match(/Nº do processo:\s*([^\n]+)\s*Órgão Judicial:/i);
        nProcesso = nProcesso ? nProcesso[1].trim() : 'Processo não encontrado';

        // Tipificação Penal (ajuste para pegar artigos)
        var tipPenal = textoCompleto.match(/Tipificação Penal:\s*(.*?)\s*Condenação:/is);
        tipPenal = tipPenal ? tipPenal[1].trim().replace(/\s+/g, ' ') : 'Tipificação Penal não encontrada';

        // Extração dos artigos do tipo penal
        var artigos = extrairArtigos(tipPenal);
        var tipificacaoPenalFormatada = artigos.length > 0 ? `${artigos.join(', ')}` : tipPenal;

        // Data de Expedição (captura apenas a data no formato dd/mm/aaaa)
        var dataExpedicao = textoCompleto.match(/Documento gerado em:\s*(\d{2}\/\d{2}\/\d{4})/i);
        dataExpedicao = dataExpedicao ? dataExpedicao[1].trim() : 'Data de expedição não encontrada';

        // Formatar a saída final
        var varTextoFinal = `
        MORADOR(A) DO END. CADASTRADO, CONSTA ${tipoDoc} VIA BNMP CONTRA: ${nome}, - RG: ${rg}, - CPF: ${cpf}, - MANDADO: ${nMandado}, - DATA DE VALIDADE: ${dataValidade}, - Nº DO PROCESSO: ${nProcesso}, - TIPIFICACAO PENAL: ${tipificacaoPenalFormatada}, - EXPEDIDO EM: ${dataExpedicao} / COPOM CAPTURA.`.trim();

        // Atualizar o textarea com o resultado
        document.getElementById('textareaResultado').value = varTextoFinal;
        atualizarContagemCaracteres();
    }

    // Função para extrair os artigos da tipificação penal
    function extrairArtigos(tipPenal) {
        const regexArtigos = /art\.? \d+/gi;
        const artigos = tipPenal.match(regexArtigos);
        return [...new Set(artigos)].map(a => a.replace(/art\.?/i, '').trim());
    }



    function extrairArtigos(tipPenal) {
        const regexArtigos = /art\. \d+/gi;
        const artigos = tipPenal.match(regexArtigos);
        return [...new Set(artigos)];
    }

    function copiarTextoResultado() {
        const texto = elementos.textareaResultado.value.trim().toUpperCase(); // Convertendo para maiúsculas e removendo espaços em branco desnecessários

        // Verificar se há conteúdo no textarea antes de copiar
        if (texto.length > 0) {
            navigator.clipboard.writeText(texto)
                .then(() => {
                    // Chamar a função exibirAvisoFlutuante com sucesso=true
                    exibirAvisoFlutuante(true);
                })
                .catch(err => {
                    console.error('Erro ao copiar texto:', err);
                    // Chamar a função exibirAvisoFlutuante com sucesso=false
                    exibirAvisoFlutuante(false);
                });
        } else {
            console.error('Nenhum texto para copiar.');
            // Chamar a função exibirAvisoFlutuante com sucesso=false
            exibirAvisoFlutuante(false);
        }
    }

    function copiarCPF() {
        const texto = elementos.cpf.trim().toUpperCase(); // Convertendo para maiúsculas e removendo espaços em branco desnecessários

        // Verificar se há conteúdo antes de copiar
        if (texto.length > 0) {
            navigator.clipboard.writeText(texto)
                .then(() => {
                    // Chamar a função exibirAvisoFlutuante com sucesso=true
                    exibirAvisoFlutuante(true);
                })
                .catch(err => {
                    console.error('Erro ao copiar CPF:', err);
                    // Chamar a função exibirAvisoFlutuante com sucesso=false
                    exibirAvisoFlutuante(false);
                });
        } else {
            console.error('Nenhum CPF para copiar.');
            // Chamar a função exibirAvisoFlutuante com sucesso=false
            exibirAvisoFlutuante(false);
        }
    }

    function copiarRG() {
        const texto = elementos.rg.replace(/[\.\-]/g, '').trim().toUpperCase(); // Removendo pontos e traços, convertendo para maiúsculas e removendo espaços em branco desnecessários

        // Verificar se há conteúdo antes de copiar
        if (texto.length > 0) {
            navigator.clipboard.writeText(texto)
                .then(() => {
                    // Chamar a função exibirAvisoFlutuante com sucesso=true
                    exibirAvisoFlutuante(true);
                })
                .catch(err => {
                    console.error('Erro ao copiar RG:', err);
                    // Chamar a função exibirAvisoFlutuante com sucesso=false
                    exibirAvisoFlutuante(false);
                });
        } else {
            console.error('Nenhum RG para copiar.');
            // Chamar a função exibirAvisoFlutuante com sucesso=false
            exibirAvisoFlutuante(false);
        }
    }

    function copiarNome() {
        const texto = elementos.nome.trim(); // Não precisa converter para maiúsculas

        // Verificar se há conteúdo antes de copiar
        if (texto.length > 0) {
            navigator.clipboard.writeText(texto)
                .then(() => {
                    // Chamar a função exibirAvisoFlutuante com sucesso=true
                    exibirAvisoFlutuante(true);
                })
                .catch(err => {
                    console.error('Erro ao copiar Nome:', err);
                    // Chamar a função exibirAvisoFlutuante com sucesso=false
                    exibirAvisoFlutuante(false);
                });
        } else {
            console.error('Nenhum Nome para copiar.');
            // Chamar a função exibirAvisoFlutuante com sucesso=false
            exibirAvisoFlutuante(false);
        }
    }

    function exibirAvisoFlutuante(sucesso) {
        var avisoFlutuante = document.getElementById('avisoFlutuante');
        avisoFlutuante.textContent = sucesso ? 'Texto Copiado com sucesso!' : 'Nenhum texto para copiar!';
        avisoFlutuante.style.display = 'block';

        // Esconder após 3 segundos
        setTimeout(function () {
            avisoFlutuante.style.display = 'none';
        }, 3000);
    }

    function analisarTextoInicial() {
        console.clear();

        var tipoDoc = '';
        var nome = '';
        var alcunha = '';
        var sexo = '';
        var rg = '';
        var cpf = '';
        var dataNasc = '';
        var nomePai = '';
        var nomeMae = '';
        var nMandado = '';
        var dataValidade = '';
        var rji = '';
        var nProcesso = '';
        var tipPenal = '';
        var dataExpedicao = '';
        var possuiFoto = false;

        // Verificar se há texto no textareaTXT
        var textoTextarea = document.getElementById('textareaTXT').value.trim();
        if (textoTextarea === '') {
            alert('Nenhum conteúdo a ser analisado.');
            elementos.textareaTXT.focus();
            return; // Sair da função se não houver texto no textareaTXT
        }

        // Verificar se o conteúdo do textarea NÃO começa com "Mandado de Prisão" ou "Mandado de Internação"
        if (!/^Mandado de (Prisão|Internação)/i.test(textoTextarea)) {
            alert('O conteúdo analisado não é um MANDADO DE PRISÃO ou MANDADO DE INTERNAÇÃO.');
            limparTextarea();
            elementos.textareaTXT.focus();
            return; // Sair da função se o texto não for um mandado de prisão ou internação
        }

        // Verificar se o checkbox está marcado
        var checkbox = document.getElementById('checkPossuiFotoTXT');
        if (checkbox.checked) {
            possuiFoto = true;
        }

        const txtResultadoFinal = elementos.textareaTXT.value;

        const regexTipoDoc = /(MANDADO DE PRISÃO|MANDADO DE INTERNAÇÃO)/i;
        const regexNome = /Nome:(.+?)(?=RJI:)/is;
        const regexAlcunha = /Alcunha: (.+?)(?=\n)/i;
        const regexSexo = /Sexo: (.+?)(?=\n)/i;
        const regexRg = (/RG:\s*([0-9.-]+|X)\b/i);
        const regexCpf = /CPF: (.+?)(?=\n)/;
        const regexDataNasc = /Data de Nasc.: (.+?)(?=\n)/i;
        const regexNomePai = /Nome do Pai: (.+?)(?=\n)/i;
        const regexNomeMae = /Nome da Mãe: (.+?)(?=\n)/i;
        const regexNMandado = /Mandado: (.+?)(?=\n)/i;
        const regexDataValidade = /Data de validade:\s*([^\n]+)/i;
        const regexRji = /RJI: (.+?)(?=\n)/i;
        const regexNProcesso = /processo: (.+?)(?=\n)/i;
        const regexTipPenal = (/Tipificação Penal:\s*(.*?)\s*Teor do Documento:/is);
        const regexDataExpedicao = (/Local e Data:\s*[^,]+,\s*([\s\S]*)/i);

        tipoDoc = capturarGrupo(regexTipoDoc, txtResultadoFinal);
        nome = capturarGrupo(regexNome, txtResultadoFinal);
        alcunha = capturarGrupo(regexAlcunha, txtResultadoFinal);
        sexo = capturarGrupo(regexSexo, txtResultadoFinal);
        rg = capturarGrupo(regexRg, txtResultadoFinal);
        cpf = capturarGrupo(regexCpf, txtResultadoFinal);
        dataNasc = capturarGrupo(regexDataNasc, txtResultadoFinal);
        nomePai = capturarGrupo(regexNomePai, txtResultadoFinal);
        nomeMae = capturarGrupo(regexNomeMae, txtResultadoFinal);
        nMandado = capturarGrupo(regexNMandado, txtResultadoFinal);
        dataValidade = capturarGrupo(regexDataValidade, txtResultadoFinal);
        rji = capturarGrupo(regexRji, txtResultadoFinal);
        nProcesso = capturarGrupo(regexNProcesso, txtResultadoFinal);
        tipPenal = capturarGrupo(regexTipPenal, txtResultadoFinal);
        dataExpedicao = capturarGrupo(regexDataExpedicao, txtResultadoFinal);

        console.log("Tipo de Documento:", tipoDoc);
        console.log("Nome:", nome);
        console.log("Alcunha:", alcunha);
        console.log("Sexo:", sexo);
        console.log("RG:", rg);
        console.log("CPF:", cpf);
        console.log("Data de Nascimento:", dataNasc);
        console.log("Nome do Pai:", nomePai);
        console.log("Nome da Mãe:", nomeMae);
        console.log("Número do Mandado:", nMandado);
        console.log("Data de Validade:", dataValidade);
        console.log("RJI:", rji);
        console.log("Número do Processo:", nProcesso);
        console.log("Tipificação Penal:", tipPenal);
        console.log("Data de Expedição:", dataExpedicao);

        // Extrair os artigos da tipificação penal
        var artigos = extrairArtigos(tipPenal);

        // Criar a variável varTextoFinal
        var varTextoFinal = '';

        if (tipoDoc.toLowerCase() === "mandado de prisão" || tipoDoc.toLowerCase() === "mandado de internação") {
            // Formatar a varTextoFinal conforme especificado
            varTextoFinal = `CONSTA ${tipoDoc} VIA BNMP CONTRA: ${nome}, - RG: ${rg}, - CPF: ${cpf}, - MANDADO: ${nMandado},`;

            // Adicionar a data de validade apenas se não for nula ou vazia
            if (dataValidade && dataValidade.trim() !== '') {
                varTextoFinal += ` - DATA DE VALIDADE: ${dataValidade},`;
            }

            varTextoFinal += ` - Nº DO PROCESSO: ${nProcesso}, - TIPIFICAÇÃO PENAL: ${artigos.join(', ')}, - EXPEDIDO EM: ${dataExpedicao}`;

            // Adicionar "possui foto no detecta" se possuiFoto for verdadeiro
            if (possuiFoto) {
                varTextoFinal += ' possui foto no detecta';
            }

            varTextoFinal += ` / COPOM CAPTURA.`;
        }

        // Defina o valor do textareaResultado como varTextoFinal
        textareaResultado.value = varTextoFinal;
        atualizarContagemCaracteres();

        // Armazenar os valores de CPF, RG e Nome para a função de cópia
        elementos.cpf = cpf;
        elementos.rg = rg;
        elementos.nome = `"${nome}"`;  // Adicionando aspas ao nome
    }

    function extrairArtigos(tipPenal) {
        const regexArtigos = /art\. \d+/gi;
        const artigos = tipPenal.match(regexArtigos);
        return [...new Set(artigos)];
    }

    function capturarGrupo(regex, texto) {
        const match = texto.match(regex);
        return match ? match[1].trim() : '';
    }

    function exibirAvisoFlutuante(sucesso) {
        var avisoFlutuante = document.getElementById('avisoFlutuante');
        avisoFlutuante.textContent = sucesso ? 'Texto Copiado com sucesso!' : 'Nenhum texto para copiar!';
        avisoFlutuante.style.display = 'block';

        // Esconder após 3 segundos
        setTimeout(function () {
            avisoFlutuante.style.display = 'none';
        }, 3000);
    }
})();
