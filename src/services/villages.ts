import { useXQuery } from "@/lib/extended-react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface VillageDetail {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  treasuryBalance: string;
  isMember: boolean;
}

// --- Dummy Data ---
const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'West African Oral History Archive',
    description: 'A cumulative effort to digitize and preserve the oral lineages of the Niger River basin elders.',
    progress: 74,
    contributors: 15,
  },
  {
    id: '2',
    title: 'Poetry Translation Cycle',
    description: 'Iterative translations of the \'Timbuktu Manuscripts\' poetry into modern French and English.',
    progress: 42,
    contributors: 7,
  }
];

const MOCK_STREAM = [
  {
    id: '1',
    author: 'Amina Diallo',
    topic: 'On Archive Ethics',
    timeAgo: '2 hours ago',
    content: 'I’ve been reflecting on the permissions for the Songhai genealogy records. Should we consider a gated tier for specific family lineages, or maintain the open common mandate?',
    contributions: 8,
    lastUpdated: '12m ago',
  },
  {
    id: '2',
    author: 'Kofi Mensah',
    topic: 'Technical Mapping',
    timeAgo: '5 hours ago',
    content: 'The metadata schema for the pottery shards is now live in the Studio. Please review the \'Spatial Anchors\' section before we finalize the commit.',
    contributions: 3,
    lastUpdated: null,
  }
];

const MOCK_NEEDS = [
  { id: '1', role: 'Yoruba Translator', project: 'Oral Histories' },
  { id: '2', role: 'Archival Mentor', project: 'Village Onboarding' },
  { id: '3', role: 'GIS Mapping Lead', project: 'Sacred Sites' },
];

const MOCK_TIMELINE = [
  { id: '1', date: 'August, 2023', title: 'The Great Confluence', description: 'First gathering of Sahelian scribes in the digital settlement. 42 founding members established the ethical charter.', dotColor: 'bg-theme-accent' },
  { id: '2', date: 'April, 2023', title: 'First Fragment Cataloged', description: 'The initial digital record of the Gao manuscripts was successfully archived.', dotColor: 'bg-theme-outline' },
  { id: '3', date: 'December, 2022', title: 'Settlement Foundation', description: 'The architecture of \'The Scribes of the Sahel\' was carved into the Village Layer.', dotColor: 'bg-theme-outline' },
];

const MOCK_VILLAGE_DETAILS: Record<string, VillageDetail> = {
  'scribes-of-sahel': {
    id: 'scribes-of-sahel',
    name: 'The Scribes of the Sahel',
    description: 'A digital settlement dedicated to archiving the oral histories and poetry of West Africa.',
    memberCount: 142,
    treasuryBalance: '45,000 SCR',
    isMember: true,
  }
};


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Hooks ---
export const useGetVillageDetails = (id: string) => {
  return useXQuery({
    queryKey: ['villageDetails', id],
    queryFn: async () => {
      await delay(5000);
      return MOCK_VILLAGE_DETAILS[id] || null;
    }
  });
};

export const useGetVillageProjects = () => {
  return useXQuery({
    queryKey: ['villageProjects'],
    queryFn: async () => {
      await delay(800);
      return MOCK_PROJECTS;
    }
  });
};

export const addMockVillageProject = (project: { id: string, title: string, description: string, progress: number, contributors: number }) => {
  MOCK_PROJECTS.unshift(project);
};

export const useGetVillageStream = () => {
  return useXQuery({
    queryKey: ['villageStream'],
    queryFn: async () => {
      await delay(1000);
      return MOCK_STREAM;
    }
  });
};

export const useGetVillageNeeds = () => {
  return useXQuery({
    queryKey: ['villageNeeds'],
    queryFn: async () => {
      await delay(600);
      return MOCK_NEEDS;
    }
  });
};

export const useGetVillageTimeline = () => {
  return useXQuery({
    queryKey: ['villageTimeline'],
    queryFn: async () => {
      await delay(500);
      return MOCK_TIMELINE;
    }
  });
};

const MOCK_FEATURED_VILLAGES = [
  { id: 'scribes-of-sahel', name: 'The Scribes of the Sahel', desc: 'Archiving West African oral histories and translated poetry.', members: 142, icon: '📜' },
  { id: 'syntactic-weavers', name: 'Syntactic Weavers', desc: 'A guild of open-source developers building decentralized primitives.', members: 89, icon: '⚡' },
  { id: 'neo-classical-agora', name: 'Neo-Classical Agora', desc: 'Philosophers and essayists discussing the intersection of tech and ethics.', members: 314, icon: '🏛️' }
];

export const useGetFeaturedVillages = () => {
  return useXQuery({
    queryKey: ['featuredVillages'],
    queryFn: async () => {
      await delay(600);
      return MOCK_FEATURED_VILLAGES;
    }
  });
}

export const useCreateVillage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description: string; tags: string[] }) => {
      await delay(1500); // simulate network
      
      const newId = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Update featured villages
      MOCK_FEATURED_VILLAGES.unshift({
        id: newId,
        name: data.name,
        desc: data.description,
        members: 1,
        icon: '🌱'
      });
      
      // Add village details
      MOCK_VILLAGE_DETAILS[newId] = {
        id: newId,
        name: data.name,
        description: data.description,
        memberCount: 1,
        treasuryBalance: '0 SCR',
        isMember: true,
      };
      
      return newId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredVillages'] });
    }
  });
};
const MOCK_FEATURED_ARTIFACTS = [
  { id: '1', title: "The Griot's Echo", community: "Scribes of the Sahel", type: "Poetry", description: "An epic poem transcribed collaboratively by 15 scholars over 3 months, translating ancient dialects into a unified digital volume." },
  { id: '2', title: "Protocol Governance Draft v2", community: "Syntactic Weavers", type: "Technical", description: "The foundational draft for the decentralized node architecture, outlining consensus rules and penalty slashing for bad actors." },
  { id: '3', title: "On the Ethics of Archives", community: "Neo-Classical Agora", type: "Essay", description: "A profound essay discussing the moral implications of digitizing artifacts that were originally meant to decay." },
  { id: '4', title: "Sahara Topography Maps", community: "Scribes of the Sahel", type: "Visual", description: "High-resolution geospatial data mapping the shifting dunes over the past two decades, crucial for historical preservation." },
  { id: '5', title: "Zero-Knowledge Rollup Spec", community: "Syntactic Weavers", type: "Technical", description: "A detailed mathematical specification outlining the ZK circuit constraints for scaling transactions without compromising privacy." }
];

export const useGetFeaturedArtifacts = () => {
  return useXQuery({
    queryKey: ['featuredArtifacts'],
    queryFn: async () => {
      await delay(700);
      return MOCK_FEATURED_ARTIFACTS;
    }
  });
};

const MOCK_VILLAGE_FEATURED_WORKS = [
  {
    id: 1,
    title: "The Griot's Echo: A Griot's Tale",
    desc: "A collection of epic poems transcribed from the oral tradition of the Griot storytellers.",
    tags: ['Poetry', 'Oral History', 'West Africa'],
    contributors: 5,
  },
  {
    id: 2,
    title: "Voices of the Diaspora",
    desc: "Personal essays and interviews from community members living abroad, connecting roots with the present.",
    tags: ['Essays', 'Interviews', 'Diaspora'],
    contributors: 8,
  },
];

const MOCK_TREASURY_ALLOCATIONS = {
  balance: '45,000 SCR',
  recentAllocations: [
    { label: 'Mali Site Prep', amount: '-450' },
    { label: 'Steward Stipends', amount: '-1,200' },
  ],
};

const MOCK_VILLAGE_MEMBERS = Array.from({ length: 13 }, (_, i) => ({
  id: String(i + 1),
  name: `Member ${i + 1}`,
  avatar: '',
}));

export const useGetVillageFeaturedWorks = (villageId: string) => {
  return useXQuery({
    queryKey: ['villageFeaturedWorks', villageId],
    queryFn: async () => {
      await delay(500);
      return MOCK_VILLAGE_FEATURED_WORKS;
    }
  });
};

export const useGetVillageTreasuryAllocations = (villageId: string) => {
  return useXQuery({
    queryKey: ['villageTreasuryAllocations', villageId],
    queryFn: async () => {
      await delay(400);
      return MOCK_TREASURY_ALLOCATIONS;
    }
  });
};

export const useGetVillageMembers = (villageId: string) => {
  return useXQuery({
    queryKey: ['villageMembers', villageId],
    queryFn: async () => {
      await delay(300);
      return MOCK_VILLAGE_MEMBERS;
    }
  });
};

