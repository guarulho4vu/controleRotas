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
2. Instale o Node.js
3. Abra a aplicação no terminal 
4. Execute npm install para instalar as dependencias
5. Execute node ./server.js para rodar o servidor
6. Abra o browser em http://localhost:3000/controlador.html ou http://localhost:3000/colaborador.html

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