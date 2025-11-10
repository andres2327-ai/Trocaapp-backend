CREATE LOGIN troca_user WITH PASSWORD = 'TuContraseñaSegura123!';
CREATE USER troca_user FOR LOGIN troca_user;
ALTER ROLE db_owner ADD MEMBER troca_user;
EXEC sp_addrolemember 'db_owner', 'troca_user';

SELECT name, type_desc FROM sys.server_principals WHERE name = 'troca_user';

USE trocaapp;
SELECT name FROM sys.database_principals WHERE name = 'troca_user';

USE trocaapp;
CREATE USER troca_user FOR LOGIN troca_user;

EXEC sp_addrolemember 'db_owner', 'troca_user';

