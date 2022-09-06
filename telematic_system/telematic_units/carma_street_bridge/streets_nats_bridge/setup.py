from setuptools import setup
import os
from glob import glob

package_name = 'streets_nats_bridge'

setup(
    name=package_name,
    version='1.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        ('share/' + package_name, glob('launch/*_launch.py')),
        (os.path.join('share', package_name, 'config'), glob('config/*.yaml'))

    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Abey Yoseph',
    maintainer_email='abey.yoseph@leidos.com',
    description='streets_nats_bridge package will publish data from carma streets kafka topics to nats topics',
    license='BSD',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'main = streets_nats_bridge.main:main'
        ],
    },
)