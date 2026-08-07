def calcular_afp_empleado(salario_nominal: float) -> float:
    """
    Calcula la retención de AFP del empleado (7.25%).
    Tope máximo cotizable: $3,000.00 mensuales.
    """
    LIMITE_AFP = 3000.00
    TASA_AFP = 0.0725
    
    salario_cotizable = min(salario_nominal, LIMITE_AFP)
    return round(salario_cotizable * TASA_AFP, 2)


def calcular_isss_empleado(salario_nominal: float) -> float:
    """
    Calcula la retención de ISSS del empleado (3.00%).
    Tope máximo cotizable: $1,000.00 mensuales.
    """
    LIMITE_ISSS = 1000.00
    TASA_ISSS = 0.03
    
    salario_cotizable = min(salario_nominal, LIMITE_ISSS)
    return round(salario_cotizable * TASA_ISSS, 2)


def calcular_isr_mensual(salario_gravable: float) -> float:
    """
    Aplica la tabla de retención mensual de ISR de El Salvador 
    basado en el salario neto gravable (Salario Nominal - AFP - ISSS).
    """
    if salario_gravable <= 472.00:
        # Tramo I: Exento
        return 0.00
    elif salario_gravable <= 895.24:
        # Tramo II
        exceso = salario_gravable - 472.00
        return round((exceso * 0.10) + 17.67, 2)
    elif salario_gravable <= 2038.10:
        # Tramo III
        exceso = salario_gravable - 895.24
        return round((exceso * 0.20) + 60.00, 2)
    else:
        # Tramo IV
        exceso = salario_gravable - 2038.10
        return round((exceso * 0.30) + 288.57, 2)


def calcular_liquidacion_boleta(salario_nominal: float) -> dict:
    """
    Función unificada que procesa el salario bruto y devuelve el desglose
    completo de las retenciones y el salario líquido neto a pagar.
    """
    afp = calcular_afp_empleado(salario_nominal)
    isss = calcular_isss_empleado(salario_nominal)
    
    salario_gravable = round(salario_nominal - afp - isss, 2)
    isr = calcular_isr_mensual(salario_gravable)
    
    total_deducciones = round(afp + isss + isr, 2)
    salario_liquido = round(salario_nominal - total_deducciones, 2)
    
    return {
        "salario_nominal": salario_nominal,
        "deduccion_afp": afp,
        "deduccion_isss": isss,
        "salario_gravable": salario_gravable,
        "deduccion_isr": isr,
        "total_deducciones": total_deducciones,
        "salario_liquido": salario_liquido
    }