const API_URL = 'http://localhost:3000';

async function testLogin(payload, testName) {
    console.log(`\n ${testName}`);
    console.log(`Payload: `, JSON.stringify(payload));

    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(data);
    const result = response.ok ? 'Éxito (Vulnerable)' 
                                : 'Falló (Seguro)';
    console.log(`${result} - Status: ${response.status}`);
    return response.ok;
};//Fin de testLogin

async function main() {
    //Test 1: Login normal (debe funcionar)
    await testLogin(
        { email: 'Admin2026@admin.com', password: 'Admin.2026#'},
        '1. Login Normal'
    ) 

    //Test 2: Intento de password con $ne (debe de fallar)
    await testLogin(
        { email: 'Admin2026@admin.com', password: { '$ne' : null } },
        '2. Ataque $ne en password'
    )

    //Test 3: Intento de email con $ne (debe de fallar)
    await testLogin(
        { email: {'$ne' : null }, password: { '$ne' : null } },
        '3. Ataque $ne en email'
    )
};//Fin de main

main().catch(console.error);