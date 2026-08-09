#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE DATABASE hotel_management;
    CREATE DATABASE hms_pricing;
    CREATE DATABASE hms_booking;
    CREATE DATABASE hms_payment;
EOSQL
