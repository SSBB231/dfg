this.seeder = {
    identity: 'DFG::SPED_Labels',
    schema: $.schema.slice(1, -1),
	base: [{
		KEY: "0",
		US_LABEL: "Original",
		BR_LABEL: "Arquivo Original",
		TYPE: "BOOKKEEPING"
            }, {
		KEY: "1",
		US_LABEL: "Rectifier",
		BR_LABEL: "Rectificação",
		TYPE: "BOOKKEEPING"
            }, {
		KEY: "1",
		US_LABEL: "Operations with non-cumulative basis",
		BR_LABEL: "Base não Cumulativa",
		TYPE: "TAX OCCURRENCE"
            }, {
		KEY: "2",
		US_LABEL: "Operations with cumulative basis",
		BR_LABEL: "Base Cumulativa",
		TYPE: "TAX OCCURRENCE"
            }, {
		KEY: "3",
		US_LABEL: "Operations with non-cumulative and cumulative basis",
		BR_LABEL: "Base não Cumulativa e Cumulativa",
		TYPE: "TAX OCCURRENCE"
            }, {
		KEY: "1",
		US_LABEL: "Direct Allocation",
		BR_LABEL: "Alocação Direta",
		TYPE: "CREDIT ALLOCATION"
            }, {
		KEY: "2",
		US_LABEL: "Proportional Apportionment (Gross Revenue)",
		BR_LABEL: "Alocação Proporcional (Margem Bruta)",
		TYPE: "CREDIT ALLOCATION"
            }, {
		KEY: "1",
		US_LABEL: "Basic Tax Rates",
		BR_LABEL: "Alíquota Base",
		TYPE: "CONTRIBUTION"
            }, {
		KEY: "2",
		US_LABEL: "Specific Tax Rates",
		BR_LABEL: "Alíquota Específica",
		TYPE: "CONTRIBUTION"
            }, {
		KEY: "1",
		US_LABEL: "Presumed Profit–Consolidated Rep. (Reg. F500)",
		BR_LABEL: "Lucro Presumido–Consolidado (Reg. F500)",
		TYPE: "ADOPTED CRITERIA"
            }, {
		KEY: "2",
		US_LABEL: "Presumed Profit–Consolidated Rep. (Reg. F550)",
		BR_LABEL: "Lucro Presumido–Consolidado (Reg. F550)",
		TYPE: "ADOPTED CRITERIA"
            }, {
		KEY: "9",
		US_LABEL: "Presumed Profit–Detailed Reporting",
		BR_LABEL: "Lucro Presumido–Relatório Detalhado",
		TYPE: "ADOPTED CRITERIA"
            }, {
		KEY: "G",
		US_LABEL: "Daily book (complete, without auxiliary bookkeeping)",
		BR_LABEL: "Livro Diário Completo",
		TYPE: "BOOKKEEPING ECD"
            }, {
		KEY: "R",
		US_LABEL: "Daily book with resumed bookkeeping (auxiliary bookkeeping)",
		BR_LABEL: "Livro Diário Resumido",
		TYPE: "BOOKKEEPING ECD"
            }, {
		KEY: "A",
		US_LABEL: "Auxiliary daily book with resumed bookkeeping",
		BR_LABEL: "Livro Auxiliar Resumido",
		TYPE: "BOOKKEEPING ECD"
            }, {
		KEY: "B",
		US_LABEL: "Daily balance books and balance sheet",
		BR_LABEL: "Balanço",
		TYPE: "BOOKKEEPING ECD"
            }, {
		KEY: "Z",
		US_LABEL: "Auxiliary major book",
		BR_LABEL: "Livro Auxiliar",
		TYPE: "BOOKKEEPING ECD"
            }, {
		KEY: "0",
		US_LABEL: "Profit and Loss Statement (DLPA)",
		BR_LABEL: "Lucros e Perdas",
		TYPE: "DEMONSTRATIVE"
            }, {
		KEY: "1",
		US_LABEL: "Changes in Equity Statement (DMPL)",
		BR_LABEL: "Demonstração de Modificações do Patrimônio",
		TYPE: "DEMONSTRATIVE"
            }, {
		KEY: "0",
		US_LABEL: "Original",
		BR_LABEL: "Original",
		TYPE: "BOOKKEEPING PURPOSE"
            }, {
		KEY: "1",
		US_LABEL: "Substitute with NIRE (Layout 5: Substitute)",
		BR_LABEL: "Substituto – NIRE",
		TYPE: "BOOKKEEPING PURPOSE"
            }, {
		KEY: "2",
		US_LABEL: "Substitute without NIRE",
		BR_LABEL: "Substituto s/ NIRE",
		TYPE: "BOOKKEEPING PURPOSE"
            }, {
		KEY: "3",
		US_LABEL: "Substitute with changed NIRE",
		BR_LABEL: "Substituto com Modificações de NIRE",
		TYPE: "BOOKKEEPING PURPOSE"
            }, {
		KEY: "0",
		US_LABEL: "Companies that are not part of SCP as ostensible partner",
		BR_LABEL: "Empresas que não fazem parte do SCP",
		TYPE: "ECD TYPE"
            }, {
		KEY: "1",
		US_LABEL: "Companies that are part of SCP as ostensible partner",
		BR_LABEL: "Empresas que fazem parte do SCP",
		TYPE: "ECD TYPE"
            }, {
		KEY: "2",
		US_LABEL: "ECD of SCP",
		BR_LABEL: "ECD do SCP",
		TYPE: "ECD TYPE"
            }, {
		KEY: "0",
		US_LABEL: "Normal",
		BR_LABEL: "Normal",
		TYPE: "SITUATION BEGINNING"
            }, {
		KEY: "1",
		US_LABEL: "Opening",
		BR_LABEL: "Aberto",
		TYPE: "SITUATION BEGINNING"
            }, {
		KEY: "2",
		US_LABEL: "Scission(Split up)/Fusion (Merge)",
		BR_LABEL: "Cisão/Fusão",
		TYPE: "SITUATION BEGINNING"
            }, {
		KEY: "3",
		US_LABEL: "Beginning of Mandatory",
		BR_LABEL: "Início de Entrega Mandatória",
		TYPE: "SITUATION BEGINNING"
            }, {
		KEY: "0",
		US_LABEL: "Not a large company",
		BR_LABEL: "Não é Empresa de Grande Porte",
		TYPE: "LARGE COMPANY INDICATOR"
            }, {
		KEY: "1",
		US_LABEL: "Large company",
		BR_LABEL: "Empresa de Grande Porte",
		TYPE: "LARGE COMPANY INDICATOR"
            }, {
		KEY: "1",
		US_LABEL: "Company reporting the posting",
		BR_LABEL: "Relatório de Contabilização por Empresa",
		TYPE: "ACCOUNTING IDENTIFICATION"
            }, {
		KEY: "2",
		US_LABEL: "Consolidated account statement",
		BR_LABEL: "Relatório Consolidado",
		TYPE: "ACCOUNTING IDENTIFICATION"
            }]
};