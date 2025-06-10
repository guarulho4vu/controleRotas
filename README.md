# Sistema de Rotas - Controlador

Um sistema de gerenciamento de rotas e colaboradores com suporte a PWA (Progressive Web App).

## Funcionalidades

- Gerenciamento de rotas
  - Adicionar novas rotas
  - Importar rotas via planilha Excel
  - Marcar rotas como executadas
  - Limpar rotas por funcionário ou todas
- Gerenciamento de colaboradores
  - Adicionar novos colaboradores
  - Editar colaboradores existentes
  - Excluir colaboradores
- Interface responsiva
- Instalação como PWA
- Armazenamento local dos dados

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript
- PWA (Service Worker, Manifest)
- LocalStorage
- XLSX.js (para importação de planilhas)

## Como Usar

1. Clone o repositório
2. Abra o arquivo `controlador.html` em um navegador moderno
3. Para instalar como PWA:
   - No Chrome/Edge: Clique no botão "Instalar App" no cabeçalho
   - No iOS: Use o Safari e adicione à tela inicial
   - No Android: Use o Chrome e adicione à tela inicial

## Estrutura do Projeto

```
.
├── controlador.html      # Página principal
├── controlador.js        # Lógica do sistema
├── styles.css           # Estilos
├── manifest.json        # Configuração do PWA
├── sw.js               # Service Worker
└── images/             # Ícones do PWA
    ├── icon-192x192.png
    └── icon-512x512.png
```

## Importação de Planilhas

Para importar rotas via planilha Excel, a planilha deve conter as seguintes colunas:
- ID
- Funcionário
- Endereço
- Número
- Complemento (opcional)

## Compatibilidade

- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+
- Opera 27+
- iOS Safari 11.3+
- Android Chrome 40+

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request 