import React from "react";
import EngineeringIcon from "@mui/icons-material/Engineering";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import BuildIcon from "@mui/icons-material/Build";
import SettingsIcon from "@mui/icons-material/Settings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

export const servicios = [
  {
    titulo: "Estudio y Consultoría",
    icono: React.createElement(EngineeringIcon),
    color: "#4fc3f7",
    items: [
      "Estudios de Viabilidad Técnico-Económica",
      "Auditorías Energéticas y de Eficiencia",
      "Análisis de Necesidades",
      "Asesoramiento Técnico Especializado",
    ],
  },
  {
    titulo: "Proyección y Diseño",
    icono: React.createElement(DesignServicesIcon),
    color: "#81c784",
    items: [
      "Desarrollo de Proyectos Ejecutivos",
      "Cálculos y Simulaciones",
      "Planificación de Proyectos",
      "Obtención de Licencias y Permisos",
    ],
  },
  {
    titulo: "Instalación e Implementación",
    icono: React.createElement(BuildIcon),
    color: "#ffb74d",
    items: [
      "Dirección de Obra y Ejecución",
      "Gestión de Compras y Suministros",
      "Coordinación de Subcontratas",
      "Puesta en Marcha y Comisionado",
    ],
  },
  {
    titulo: "Mantenimiento y Soporte",
    icono: React.createElement(SettingsIcon),
    color: "#ba68c8",
    items: [
      "Planes de Mantenimiento Preventivo y Predictivo",
      "Mantenimiento Correctivo",
      "Monitoreo Remoto y Telemetría",
      "Servicio de Asistencia Técnica 24/7",
    ],
  },
  {
    titulo: "Gestión y Optimización",
    icono: React.createElement(ManageAccountsIcon),
    color: "#ff8a65",
    items: [
      "Gestión Integral de Proyectos (Project Management)",
      "Gestión de Activos",
      "Optimización de Procesos",
      "Gestión Documental",
    ],
  },
];
