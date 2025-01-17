from setuptools import setup, find_packages
setup(
    name='panacea_api',
    version='0.1.1',
    packages=find_packages(include=['panacea_api', 'panacea_api.*']),
    install_requires=['psycopg2']
)