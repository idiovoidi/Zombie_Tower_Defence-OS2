Upgradable survivor camp for passive income and effects

NPCs that go chop wood or scavenge that can be sent out

Change flame tower to grenade

Have shaders take effect briefly and fade out on round start
Have the full horror shader upon defeat

Refactor src\objects\Tower.ts to no longer have tower specific code and to handle instances of towers instead
Also refactor  
src\managers\TowerCombatManager.ts as it also handles some tower animations meaning our code is divided between files as Tower.ts also handles some animations

Shotgun uses a double barrel with two quick shots and a small delay for reload

---

Implemented design plans
Lower machine gun damage, weight upgrades towards fire rate
