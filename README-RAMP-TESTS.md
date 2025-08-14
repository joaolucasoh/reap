# Testes Playwright para Ramp

Este projeto contém testes automatizados para as funcionalidades de autenticação (signup/signin) da aplicação Ramp.

## Estrutura dos Testes

### Arquivo: `tests/ramp-auth.spec.ts`

Os testes estão organizados nas seguintes categorias:

#### 1. **Sign Up Page**
- ✅ Verificação da presença de todos os campos obrigatórios
- ✅ Validação de campos vazios
- ✅ Validação de formato de email
- ✅ Validação de requisitos de senha
- ✅ Preenchimento com dados válidos
- ✅ Tentativa de submissão do formulário

#### 2. **Sign In Navigation**
- ✅ Verificação de link para página de login
- ✅ Navegação entre páginas

#### 3. **Sign In Page**
- ✅ Exibição do formulário de login
- ✅ Validação de campos do formulário
- ✅ Tentativa de login com credenciais de teste

#### 4. **General UI Tests**
- ✅ Responsividade em dispositivos móveis
- ✅ Tempo de carregamento da página

## Como Executar os Testes

### Pré-requisitos
```bash
# Instalar dependências
npm install

# Instalar browsers do Playwright (se necessário)
npx playwright install
```

### Comandos Disponíveis

```bash
# Executar todos os testes
npm run test

# Executar apenas os testes da Ramp
npm run test:ramp

# Executar testes com interface gráfica (headed mode)
npm run test:headed

# Executar testes da Ramp com interface gráfica
npm run test:ramp:headed

# Visualizar relatório dos testes
npm run test:report
```

### Executar Testes Específicos

```bash
# Executar apenas testes de signup
npx playwright test -g "Sign Up Page"

# Executar apenas testes de signin
npx playwright test -g "Sign In"

# Executar em um browser específico
npx playwright test --project=chromium ramp-auth.spec.ts
```

## Configuração dos Testes

### Browsers Testados
- ✅ Chromium (Chrome)
- ✅ Firefox
- ✅ WebKit (Safari)

### Funcionalidades Testadas

#### Validações de Formulário
- Campos obrigatórios
- Formato de email
- Requisitos de senha
- Mensagens de erro

#### Fluxos de Usuário
- Preenchimento de formulários
- Submissão de dados
- Navegação entre páginas
- Responsividade

#### Performance
- Tempo de carregamento
- Responsividade em diferentes viewports

## Arquitetura Page Object Model (POM)

Os testes utilizam o padrão Page Object Model para melhor organização e reutilização de código:

### BasePage
Classe base que contém funcionalidades comuns a todas as páginas:
- Navegação e verificação de título
- Preenchimento de campos e cliques
- Verificação de visibilidade de elementos
- Configuração de viewport para responsividade
- Métodos de espera e obtenção de URL

### SignUpPage
Page Object específico para a página de cadastro:
- Seletores para campos de email, nome, sobrenome e senha
- Métodos para preenchimento e submissão do formulário
- Validação de email inválido e senha fraca
- Verificação de mensagens de erro
- Navegação para página de login

### SignInPage
Page Object específico para a página de login:
- Seletores para campos de email e senha
- Métodos para login e validação de campos vazios
- Verificação de redirecionamento após login
- Navegação para páginas de cadastro e recuperação de senha

### Constantes de Teste
O arquivo `index.ts` contém:
- Dados de usuário válido e inválido
- Credenciais de teste
- Configurações de timeout
- Interfaces TypeScript para tipagem

## Estrutura do Projeto

```
reap/
├── tests/
│   ├── pages/                   # Page Objects (Padrão POM)
│   │   ├── BasePage.ts         # Classe base com funcionalidades comuns
│   │   ├── SignUpPage.ts       # Page Object para página de cadastro
│   │   ├── SignInPage.ts       # Page Object para página de login
│   │   └── index.ts            # Exports e constantes de teste
│   ├── example.spec.ts          # Testes de exemplo
│   └── ramp-auth.spec.ts        # Testes da Ramp
├── playwright.config.ts         # Configuração do Playwright
├── package.json                 # Scripts e dependências
└── README-RAMP-TESTS.md        # Esta documentação
```

## Notas Importantes

### Limitações dos Testes
- Os testes não criam contas reais (usam dados fictícios)
- Alguns testes podem falhar se a estrutura da página mudar
- Os testes de submissão verificam apenas a resposta do sistema

### Manutenção
- Atualize os seletores se a interface da Ramp mudar
- Ajuste os timeouts conforme necessário
- Adicione novos casos de teste conforme novos requisitos

### Debugging
- Use `--headed` para ver os testes executando
- Use `--debug` para pausar e inspecionar
- Verifique o relatório HTML para detalhes dos falhas

## Próximos Passos

1. **Expandir Cobertura**: Adicionar testes para outros fluxos
2. **Dados de Teste**: Implementar geração de dados dinâmicos
3. **Integração**: Configurar CI/CD para execução automática
4. **Monitoramento**: Adicionar testes de performance mais detalhados