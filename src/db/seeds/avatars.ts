import { db } from '@/db';
import { avatars } from '@/db/schema';

async function main() {
    const sampleAvatars = [
        {
            url: 'https://gif-avatars.com/img/90x90/pp-saringan.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/clar5554.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/avatar-104.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/666.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/gohan-ssj2.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/ultra-instinct-goku.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/nocitis.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/kaneki.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/sad-yuu.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/naruto-1.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/soul-eater.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/agnes-check.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/avatar-116.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/yourlie.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/avatar-110.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/kawaii-tsukasa.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/girl-2.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/lisbeth.gif',
        },
        {
            url: 'https://gif-avatars.com/img/90x90/avatar-59.gif',
        },
    ];

    await db.insert(avatars).values(sampleAvatars);
    
    console.log('✅ Avatars seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});