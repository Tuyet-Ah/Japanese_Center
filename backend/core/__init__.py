import pymysql

pymysql.version_info = (2, 2, 1, "final", 0) # Đây là dòng "vượt rào" quan trọng nhất
pymysql.install_as_MySQLdb()