import type { Department } from '@/hooks/useData';

export type DepartmentArtwork = {
    iconUrl: string;
    backgroundUrl: string;
};

const ART_BASE = '/department-art';

const ARTWORK_BY_KEY: Record<string, DepartmentArtwork> = {
    physics: {
        iconUrl: `${ART_BASE}/physics-icon.svg`,
        backgroundUrl: `${ART_BASE}/physics-bg.svg`,
    },
    computer: {
        iconUrl: `${ART_BASE}/computer-icon.svg`,
        backgroundUrl: `${ART_BASE}/computer-bg.svg`,
    },
    industrial: {
        iconUrl: `${ART_BASE}/industrial-icon.svg`,
        backgroundUrl: `${ART_BASE}/industrial-bg.svg`,
    },
    business: {
        iconUrl: `${ART_BASE}/business-icon.svg`,
        backgroundUrl: `${ART_BASE}/business-bg.svg`,
    },
    chemistry: {
        iconUrl: `${ART_BASE}/chemistry-icon.svg`,
        backgroundUrl: `${ART_BASE}/chemistry-bg.svg`,
    },
    biology: {
        iconUrl: `${ART_BASE}/biology-icon.svg`,
        backgroundUrl: `${ART_BASE}/biology-bg.svg`,
    },
    art: {
        iconUrl: `${ART_BASE}/art-icon.svg`,
        backgroundUrl: `${ART_BASE}/art-bg.svg`,
    },
    education: {
        iconUrl: `${ART_BASE}/education-icon.svg`,
        backgroundUrl: `${ART_BASE}/education-bg.svg`,
    },
};

const DEFAULT_ARTWORK = ARTWORK_BY_KEY.education;

export function getDepartmentArtwork(department: Pick<Department, 'id' | 'name' | 'iconUrl' | 'backgroundUrl' | 'icon'>): DepartmentArtwork {
    const haystack = `${department.id || ''} ${department.name || ''} ${department.icon || ''}`.toLowerCase();
    const key = Object.keys(ARTWORK_BY_KEY).find(candidate => haystack.includes(candidate));
    const fallback = key ? ARTWORK_BY_KEY[key] : DEFAULT_ARTWORK;

    return {
        iconUrl: department.iconUrl || fallback.iconUrl,
        backgroundUrl: department.backgroundUrl || fallback.backgroundUrl,
    };
}
