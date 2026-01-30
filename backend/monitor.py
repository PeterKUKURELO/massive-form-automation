#!/usr/bin/env python3
"""
Monitor de recursos del sistema
Detecta problemas de memoria y procesos Chrome
"""

import psutil
import time
import subprocess
import os
from datetime import datetime

def get_chrome_processes():
    """Obtiene todos los procesos Chrome/Chromium"""
    chrome_procs = []
    for proc in psutil.process_iter(['pid', 'name', 'memory_info', 'create_time']):
        try:
            if 'chrome' in proc.info['name'].lower() or 'chromium' in proc.info['name'].lower():
                chrome_procs.append(proc)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return chrome_procs

def get_system_stats():
    """Obtiene estadísticas del sistema"""
    memory = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=1)
    
    return {
        'memory_total': memory.total / (1024**3),  # GB
        'memory_used': memory.used / (1024**3),   # GB
        'memory_percent': memory.percent,
        'cpu_percent': cpu,
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }

def monitor_resources(duration=60, interval=5):
    """Monitorea recursos por un tiempo determinado"""
    print("🔍 MONITOR DE RECURSOS INICIADO")
    print("=" * 50)
    
    start_time = time.time()
    
    while time.time() - start_time < duration:
        stats = get_system_stats()
        chrome_procs = get_chrome_processes()
        
        print(f"\n[{stats['timestamp']}]")
        print(f"💾 RAM: {stats['memory_used']:.1f}GB / {stats['memory_total']:.1f}GB ({stats['memory_percent']:.1f}%)")
        print(f"🖥️  CPU: {stats['cpu_percent']:.1f}%")
        print(f"🌐 Chrome procesos: {len(chrome_procs)}")
        
        if chrome_procs:
            total_chrome_memory = sum(proc.memory_info().rss for proc in chrome_procs) / (1024**2)  # MB
            print(f"   └─ Memoria Chrome: {total_chrome_memory:.1f}MB")
            
            if total_chrome_memory > 1000:  # > 1GB
                print("   ⚠️  ALERTA: Chrome usando mucha memoria!")
        
        if stats['memory_percent'] > 85:
            print("🚨 ALERTA: Memoria del sistema crítica!")
            
        time.sleep(interval)

def kill_zombie_chrome():
    """Mata procesos Chrome zombi"""
    chrome_procs = get_chrome_processes()
    killed = 0
    
    for proc in chrome_procs:
        try:
            proc.terminate()
            killed += 1
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    if killed > 0:
        print(f"🧹 Eliminados {killed} procesos Chrome")
        time.sleep(2)  # Esperar terminación
        
        # Force kill si es necesario
        for proc in get_chrome_processes():
            try:
                proc.kill()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "clean":
            print("🧹 Limpiando procesos Chrome...")
            kill_zombie_chrome()
        elif sys.argv[1] == "monitor":
            duration = int(sys.argv[2]) if len(sys.argv) > 2 else 60
            monitor_resources(duration)
    else:
        print("Uso:")
        print("  python monitor.py clean     - Limpiar procesos Chrome")
        print("  python monitor.py monitor [segundos] - Monitorear recursos")