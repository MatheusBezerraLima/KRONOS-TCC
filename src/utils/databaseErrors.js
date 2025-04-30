export const DatabaseErrors = {
    // Erros de inserção (CREATE)
    DUPLICATE_ENTRY:        'ER_DUP_ENTRY',               // Entrada duplicada (chave primária ou UNIQUE)
    BAD_NULL_ERROR:         'ER_BAD_NULL_ERROR',          // Campo obrigatório não pode ser NULL
    WRONG_VALUE:            'ER_TRUNCATED_WRONG_VALUE',   // Tipo de dado incorreto
  
    // Erros de leitura/consulta (READ)
    SYNTAX_ERROR:           'ER_PARSE_ERROR',             // Erro de sintaxe na query SQL
    NO_SUCH_TABLE:          'ER_NO_SUCH_TABLE',           // A tabela consultada não existe
  
    // Erros de atualização (UPDATE)
    ROW_IS_REFERENCED:      'ER_ROW_IS_REFERENCED',       // Linha referenciada por chave estrangeira
    NO_REFERENCED_ROW:      'ER_NO_REFERENCED_ROW',       // Valor da foreign key não existe
  
    // Erros de exclusão (DELETE)
    CANNOT_DELETE_OR_UPDATE_PARENT_ROW: 'ER_ROW_IS_REFERENCED_2', // Restrição de integridade referencial
  
    // Conexão
    CONNECTION_LOST:        'PROTOCOL_CONNECTION_LOST',   // Conexão com o banco foi perdida
    CONNECTION_REFUSED:     'ECONNREFUSED',               // Banco recusou conexão
    TIMEOUT:                'ETIMEDOUT',                  // Tempo de espera excedido
  
    // Genérico
    UNKNOWN:                'UNKNOWN'                     // Erro não identificado
  };
  
  