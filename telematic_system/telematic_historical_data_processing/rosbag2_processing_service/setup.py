from setuptools import setup
import os
from glob import glob

package_name = 'rosbag2_processing_service'

setup(
    name=package_name,
    version='1.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml'])

    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='carma',
    maintainer_email='carma',
    description='rosbag2 processing service',
    license='BSD',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'main = rosbag2_processing_service.main:main'
        ],
    },
)