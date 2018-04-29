$.import('timp.core.server.api', 'api');
const coreApi = $.timp.core.server.api.api;

this.component = {
	name: "DFG",
	version: coreApi.systemVersion,
	description: "Digital File Generator",
	objectTypesActions: {
		"DFG::Layout": ["create", "read", "update", "delete"],
		"DFG::LayoutHeader": ["create", "read", "update", "delete"],
		"DFG::LayoutVersion": ["create", "read", "update", "delete"],
		"DFG::LayoutType": ["create", "read", "update", "delete"],
		"DFG::Setting": ["create", "read", "update", "delete"],
		"DFG::DigitalFile": ["create", "read", "update", "delete"],
		"DFG::AN3": ["create", "read", "update", "delete"],
		"DFG::AN4": ["create", "read", "update", "delete"],
		"DFG::Sped": ["create", "read", "update", "delete"],
		"DFG::SpedExternalFile": ["create", "read", "update", "delete"],
		"DFG::Panel": ["create", "read", "update", "delete"],
		"DFG::PanelSetting": ["create", "read", "update", "delete"],
		"DFG::subPeriodoFiscal": ["create", "read", "update", "delete"],
		"DFG::EFDICMSIPIVariant": ["create", "read", "update", "delete"]
	},
	apps: [{
		name: "Digital File Generator",
		url: "/timp/dfg/",
		icon: "filleddocument",
		background: "#FF9900",
		iconfont: "File-and-Folders",
		description: "Digital File Generator",
		usLabel: "Digital File Generator",
		brLabel: "Gestor de Obrigações",
		privileges: [{
			name: "Access",
			description: "Permissão para acessar o DFG",
			descriptionPtBr: "Permissão para acessar o DFG",
			descriptionEnUs: "Permission to access to DFG",
			role: "timp.core.server.role::DFG.Access"
		}]
    }]
};