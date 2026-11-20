/* eslint @typescript-eslint/no-require-imports: "off" -- Regressão Node isolada, fora do aplicativo. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
if(!process.argv.includes('--isolated-db'))throw new Error('Use somente uma API com banco descartável e --isolated-db.');
const BASE=process.env.VISUAL_BASE_URL||'http://localhost:3001',API=process.env.VISUAL_API_URL||'http://localhost:3000/api';
const OUT=path.resolve(__dirname,'../../../docs/correcoes-2026-11-05/navegacao');fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
 try {
  for(const route of ['/pokedex','/ranking']) {await page.goto(BASE+route);await page.locator('.pk-header').waitFor();assert.equal(await page.locator('.pk-sidebar').count(),0);}
  results.push('Catálogo e ranking públicos sem autenticação');
  const suffix=Date.now(),name=`Navegacao ${suffix}`,email=`nav${suffix}@example.test`;
  const registered=await context.request.post(API+'/auth/register',{data:{name,email,password:'Navigation-test-123'}});assert.equal(registered.status(),201);
  // Sem marcadores locais: força a restauração por cookie HttpOnly.
  await page.goto(BASE+'/pokedex');await page.locator('.pk-sidebar').waitFor();await page.getByRole('heading',{name:'Pokédex de Kanto',exact:true}).waitFor();
  await page.screenshot({path:path.join(OUT,'catalogo-autenticado.png'),fullPage:true});
  await page.reload();await page.locator('.pk-sidebar').waitFor();
  await page.locator('.pk-sidebar').getByRole('link',{name:'Ranking',exact:true}).click();await page.getByRole('heading',{name:'Ranking de Treinadores',exact:true}).waitFor();assert.equal(await page.locator('.pk-sidebar').count(),1);
  await page.screenshot({path:path.join(OUT,'ranking-autenticado.png'),fullPage:true});
  await page.goto(BASE+'/pokedex/25');await page.getByRole('heading',{name:'pikachu',exact:true}).waitFor();assert.equal(await page.locator('.pk-sidebar').count(),1);
  results.push('Sidebar em catálogo, ranking e detalhes; navegação e recarga por cookie');
  await page.goto(BASE+'/admin/users');await page.locator('tbody tr').first().waitFor();
  const createdName=`Cadastrado ${suffix}`;await page.getByLabel('Nome',{exact:true}).fill(createdName);await page.getByLabel('E-mail',{exact:true}).fill(`created${suffix}@example.test`);await page.getByLabel('Senha da nova conta').fill('Created-test-123');await page.getByRole('button',{name:'Cadastrar',exact:true}).click();
  await page.getByRole('cell',{name:createdName,exact:true}).waitFor();await page.reload();await page.getByRole('cell',{name:createdName,exact:true}).waitFor();
  const createdRow=page.getByRole('row').filter({hasText:createdName});assert.equal(await createdRow.getByRole('button').count(),0);
  await page.getByRole('button',{name:'Editar',exact:true}).click();await page.getByLabel('Nome',{exact:true}).fill(`Nome atualizado ${suffix}`);await page.getByRole('button',{name:'Salvar',exact:true}).click();await page.locator('.pk-sidebar-user').getByText(`Nome atualizado ${suffix}`,{exact:true}).waitFor();
  const me=await(await context.request.get(API+'/profiles/me')).json();assert.equal(me.name,me.profile.trainerName);assert.equal(me.name,me.profile.fullName);
  await page.screenshot({path:path.join(OUT,'contas-listadas.png'),fullPage:true});results.push('Conta criada persiste na lista, ações restritas à própria conta e nomes sincronizados');
  await page.goto(BASE+'/equipes');await page.getByRole('button',{name:'Criar equipe',exact:false}).click();await page.getByLabel('Nome da equipe',{exact:true}).fill('Envio protegido');
  let release;const gate=new Promise(resolve=>{release=resolve;});let entered;const started=new Promise(resolve=>{entered=resolve;});
  await page.route('**/api/teams',async route=>{if(route.request().method()==='POST'){entered();await gate;}await route.continue();});
  await page.getByRole('button',{name:'Salvar equipe',exact:true}).click();await started;await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').isVisible(),true);
  await page.getByRole('button',{name:'Fechar janela',exact:true}).click();assert.equal(await page.getByRole('dialog').isVisible(),true);
  release();await page.getByRole('heading',{name:'Envio protegido',exact:true}).waitFor();await page.unroute('**/api/teams');results.push('Escape e fechar preservam modal enquanto salva; equipe persistida');
  await page.goto(BASE+'/logout');await page.waitForURL(BASE+'/');await page.goto(BASE+'/ranking');await page.locator('.pk-header').waitFor();assert.equal(await page.locator('.pk-sidebar').count(),0);results.push('Logout restaura acesso público');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(OUT,'resultados.json'),JSON.stringify({results,pageErrors:errors},null,2));console.log('PASS NAVEGACAO',results.length,'cenários; nenhum pageerror');
 }catch(error){await page.screenshot({path:path.join(OUT,'failure.png'),fullPage:true});throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
