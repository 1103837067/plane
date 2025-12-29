#!/usr/bin/env python
"""Development server runner - 直接运行,不需要导入 plane 包"""
import os
import subprocess
import sys
from pathlib import Path


def main():
    """启动 Django 开发服务器"""
    # 获取当前目录 (apps/api)
    current_dir = Path(__file__).parent
    
    # 加载 .env 文件
    env_file = current_dir / '.env'
    env = os.environ.copy()
    
    if env_file.exists():
        print(f"Loading environment from {env_file}")
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # 移除引号
                    value = value.strip().strip('"').strip("'")
                    env[key.strip()] = value
    
    # 启动 Django
    cmd = [sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000']
    print(f"Running: {' '.join(cmd)}")
    subprocess.run(cmd, cwd=current_dir, env=env)


if __name__ == '__main__':
    main()

