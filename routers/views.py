from fastapi import APIRouter, Request, Depends, Form, status, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import database
import crud
from typing import Optional
import os
from datetime import datetime
from schemas.empleado import EmpleadoCreate
from schemas.contrato import ContratoCreate

router = APIRouter(tags=["Vistas de Interfaz Web (UI)"])

templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
os.makedirs(templates_dir, exist_ok=True)
templates = Jinja2Templates(directory=templates_dir)


@router.get("/", response_class=HTMLResponse)
def renderizar_login_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={"titulo": "Inicio de Sesión - Planillas El Salvador"}
    )


@router.post("/", response_class=HTMLResponse)
def procesar_login_ui(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(database.get_db)
):
    usuario = crud.seguridad.obtener_usuario_por_username(db, username=username)
    
    if not usuario or not crud.seguridad.pwd_context.verify(password, usuario.password_hash):
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={
                "titulo": "Inicio de Sesión - Planillas El Salvador", 
                "error": "Credenciales de acceso inválidas en el sistema."
            }
        )
    
    if not usuario.es_activo:
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={
                "titulo": "Inicio de Sesión - Planillas El Salvador", 
                "error": "El usuario se encuentra actualmente inactivo."
            }
        )
    
    from auth.jwt import crear_token_acceso
    codigos_permisos = [p.codigo_permiso for p in usuario.rol.permisos] if usuario.rol else []
    
    datos_token = {
        "sub": usuario.username,
        "permisos": codigos_permisos
    }
    
    token_jwt = crear_token_acceso(data=datos_token)
    response = RedirectResponse(url="/dashboard", status_code=status.HTTP_303_SEE_OTHER)
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token_jwt}",
        httponly=True,
        max_age=3600,
        expires=3600,
        samesite="lax",
        secure=False
    )
    
    return response


@router.get("/dashboard", response_class=HTMLResponse)
def renderizar_dashboard_principal(request: Request, db: Session = Depends(database.get_db)):
    empleados = crud.recursos_humanos.listar_empleados(db, skip=0, limit=5)
    contexto = {
        "titulo": "Consola de Control HR 360",
        "empleados_recientes": empleados
    }
    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context=contexto
    )


@router.get("/logout", response_class=HTMLResponse)
def procesar_logout(request: Request):
    response = templates.TemplateResponse(
        request=request,
        name="logout.html",
        context={"titulo": "Sesión Cerrada - Planillas El Salvador"}
    )
    
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False 
    )
    return response


@router.get("/empleados", response_class=HTMLResponse)
def renderizar_modulo_empleados(request: Request, db: Session = Depends(database.get_db)):
    empleados = crud.recursos_humanos.listar_empleados(db, skip=0, limit=100)
    
    return templates.TemplateResponse(
        request=request,
        name="empleados.html",
        context={
            "titulo": "Gestión de Empleados - Planillas El Salvador",
            "lista_empleados": empleados
        }
    )


@router.get("/empleados/nuevo", response_class=HTMLResponse)
def formulario_nuevo_empleado(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="empleados_formulario.html",
        context={"titulo": "Registrar Empleado - Planillas El Salvador"}
    )


@router.post("/empleados/nuevo")
def procesar_nuevo_empleado(
    request: Request,
    primer_nombre: str = Form(...),
    segundo_nombre: Optional[str] = Form(None),
    primer_apellido: str = Form(...),
    segundo_apellido: Optional[str] = Form(None),
    dui: str = Form(...),
    nit: str = Form(...),
    isss_afiliacion: Optional[str] = Form(None),
    nup_afp: Optional[str] = Form(None),
    email_institucional: Optional[str] = Form(None),
    telefono: Optional[str] = Form(None),
    fecha_nacimiento: str = Form(...),
    genero: str = Form(...),
    estado_familiar: str = Form(...),
    profesion_oficio: str = Form(...),
    nacionalidad: str = Form(...),
    municipio_residencia: str = Form(...),
    db: Session = Depends(database.get_db)
):
    try:
        fecha_nac_dt = datetime.strptime(fecha_nacimiento, "%Y-%m-%d").date()
        
        datos_empleado = {
            "primer_nombre": primer_nombre.strip(),
            "segundo_nombre": segundo_nombre.strip() if segundo_nombre else None,
            "primer_apellido": primer_apellido.strip(),
            "segundo_apellido": segundo_apellido.strip() if segundo_apellido else None,
            "dui": dui.strip(),
            "nit": nit.strip(),
            "isss_afiliacion": isss_afiliacion.strip() if isss_afiliacion else None,
            "nup_afp": nup_afp.strip() if nup_afp else None,
            "email_institucional": email_institucional.strip() if email_institucional else None,
            "telefono": telefono.strip() if telefono else None,
            "fecha_nacimiento": fecha_nac_dt,
            "genero": genero.strip().upper(),
            "estado_familiar": estado_familiar.strip(),
            "profesion_oficio": profesion_oficio.strip(),
            "nacionalidad": nacionalidad.strip(),
            "municipio_residencia": municipio_residencia.strip(),
            "puesto_id": None
        }
        
        empleado_validado = EmpleadoCreate(**datos_empleado)
        crud.recursos_humanos.crear_empleado(db, empleado=empleado_validado)
        
        return RedirectResponse(url="/empleados", status_code=status.HTTP_303_SEE_OTHER)
        
    except HTTPException as e:
        return templates.TemplateResponse(
            request=request,
            name="empleados_formulario.html",
            context={
                "titulo": "Registrar Empleado - Planillas El Salvador",
                "error": e.detail,
                "valores": request._form
            }
        )
    except Exception as e:
        return templates.TemplateResponse(
            request=request,
            name="empleados_formulario.html",
            context={
                "titulo": "Registrar Empleado - Planillas El Salvador",
                "error": f"Error no controlado: {str(e)}",
                "valores": request._form
            }
        )

@router.get("/empleados/{empleado_id}/contrato/nuevo", response_class=HTMLResponse)
def formulario_nuevo_contrato(request: Request, empleado_id: int, db: Session = Depends(database.get_db)):
    empleado = crud.recursos_humanos.obtener_empleado(db, empleado_id=empleado_id)
    if not empleado:
        return RedirectResponse(url="/empleados", status_code=status.HTTP_303_SEE_OTHER)
        
    return templates.TemplateResponse(
        request=request,
        name="contrato_formulario.html",
        context={
            "titulo": "Asignar Contrato - Planillas El Salvador",
            "empleado": empleado
        }
    )


@router.post("/empleados/{empleado_id}/contrato/nuevo")
def procesar_nuevo_contrato(
    request: Request,
    empleado_id: int,
    tipo_contrato: str = Form(...),
    cargo: str = Form(...),
    salario_base: float = Form(...),
    fecha_inicio: str = Form(...),
    fecha_fin: Optional[str] = Form(None),
    lugar_trabajo: str = Form(...),
    horario_trabajo: str = Form(...),
    forma_pago: str = Form(...),
    municipio_celebracion: str = Form(...),
    db: Session = Depends(database.get_db)
):
    try:
        fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
        fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d").date() if fecha_fin else None
        
        datos_contrato = {
            "empleado_id": empleado_id,
            "tipo_contrato": tipo_contrato.strip(),
            "cargo": cargo.strip(),
            "salario_base": salario_base,
            "fecha_inicio": fecha_inicio_dt,
            "fecha_fin": fecha_fin_dt,
            "lugar_trabajo": lugar_trabajo.strip(),
            "horario_trabajo": horario_trabajo.strip(),
            "forma_pago": forma_pago.strip(),
            "municipio_celebracion": municipio_celebracion.strip(),
            "es_activo": True
        }
        
        contrato_validado = ContratoCreate(**datos_contrato)
        crud.recursos_humanos.crear_contrato(db, contrato=contrato_validado)
        
        return RedirectResponse(url="/empleados", status_code=status.HTTP_303_SEE_OTHER)
        
    except HTTPException as e:
        empleado = crud.recursos_humanos.obtener_empleado(db, empleado_id=empleado_id)
        return templates.TemplateResponse(
            request=request,
            name="contrato_formulario.html",
            context={
                "titulo": "Asignar Contrato - Planillas El Salvador",
                "empleado": empleado,
                "error": e.detail
            }
        )
    except Exception as e:
        empleado = crud.recursos_humanos.obtener_empleado(db, empleado_id=empleado_id)
        return templates.TemplateResponse(
            request=request,
            name="contrato_formulario.html",
            context={
                "titulo": "Asignar Contrato - Planillas El Salvador",
                "empleado": empleado,
                "error": f"Error no controlado: {str(e)}"
            }
        )
    
@router.get("/empleados/{empleado_id}/contrato/imprimir", response_class=HTMLResponse)
def renderizar_contrato_legal_imprimible(
    request: Request,
    empleado_id: int, 
    db: Session = Depends(database.get_db)
):
    empleado = crud.recursos_humanos.obtener_empleado(db, empleado_id=empleado_id)
    if not empleado:
        return RedirectResponse(url="/empleados", status_code=status.HTTP_303_SEE_OTHER)
        
    contrato_activo = crud.recursos_humanos.obtener_contrato_activo(db, empleado_id=empleado_id)
    if not contrato_activo:
        empleados = crud.recursos_humanos.listar_empleados(db)
        return templates.TemplateResponse(
            request=request,
            name="empleados.html",
            context={
                "titulo": "Gestión de Empleados - Planillas El Salvador",
                "lista_empleados": empleados,
                "error": "El empleado seleccionado no cuenta con un contrato laboral activo para generar el documento."
            }
        )
        
    return templates.TemplateResponse(
        request=request,
        name="contrato_legal_imprimir.html",
        context={
            "titulo": f"Contrato Laboral - {empleado.primer_nombre} {empleado.primer_apellido}",
            "empleado": empleado,
            "contrato": contrato_activo,
            "fecha_actual": datetime.now().date()
        }
    )