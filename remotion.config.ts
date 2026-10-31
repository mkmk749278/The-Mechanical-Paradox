import {Config} from '@remotion/cli/config';

// One workspace for every film (PLAYBOOK §10.1). Public assets: public/ (fonts) + public/films/<slug>/ (media pulled
// from Drive, gitignored). 60 fps authored at 1920×1080; review cuts at scale 2/3 (720p), the master at 2 (4K).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swangle'); // measured on the sister channel: angle fails in the cloud container
