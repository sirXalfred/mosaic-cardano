import { useXQuery } from "@/lib/extended-react-query";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { addMockVillageProject } from "./villages";

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectContributor {
  id: string;
  name: string;
  role: string;
  attributionPercentage: number;
  avatarUrl?: string;
  initials: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: 'Unassigned' | 'Claimed' | 'Completed';
  assigneeId?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  status: 'Pending' | 'Active' | 'Completed';
  tasks: ProjectTask[];
}

export interface ProjectArtifact {
  id: string;
  title: string;
  status: 'Draft' | 'Under Review' | 'Published';
  updatedAt: string;
  authorIds: string[];
  content: string;
}

export interface ProjectDiscussion {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface ProjectReference {
  id: string;
  title: string;
  url: string;
  type: 'Document' | 'Link' | 'Archive';
}

export interface ProjectDetail {
  id: string;
  communityId: string;
  title: string;
  description: string;
  progress: number;
  status: 'Active Hearth' | 'Emerging' | 'Quiet Archive';
  dateCreated: string;
  targetDeadline: string;
  tags: string[];
  contributors: ProjectContributor[];
  milestones: ProjectMilestone[];
  artifacts: ProjectArtifact[];
  discussions: ProjectDiscussion[];
  references: ProjectReference[];
}

export interface DocumentComment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  blockId?: string; // Links comment to a specific paragraph/block
}

export interface DocumentRevision {
  id: string;
  timestamp: string;
  authorName: string;
  description: string;
}

export interface ArtifactAnalytics {
  readershipQualityScore: number; // 0-100
  citations: number;
  saves: number;
  communityReuse: number;
  supporterConversionRate: number; // percentage
  contributionSpread: {
    label: string;
    percentage: number;
  }[];
}

// ============================================================================
// DUMMY DATASET
// ============================================================================

const MOCK_PROJECT_DETAILS: Record<string, ProjectDetail> = {
  '1': {
    id: '1',
    communityId: 'scribes-of-sahel',
    title: 'West African Oral History Archive',
    description: 'A cumulative effort to digitize and preserve the oral lineages of the Niger River basin elders. We are currently focusing on the Songhai genealogy records.',
    progress: 74,
    status: 'Active Hearth',
    dateCreated: 'Oct 12, 2023',
    targetDeadline: 'Dec 31, 2026',
    tags: ['Oral History', 'Translation', 'Preservation'],
    contributors: [
      { id: 'user_1', name: 'Amina Diallo', role: 'Lead Archivist', attributionPercentage: 45, initials: 'AD' },
      { id: 'user_2', name: 'Kofi Mensah', role: 'GIS Specialist', attributionPercentage: 25, initials: 'KM' },
      { id: 'user_123', name: 'David Adeleke', role: 'Translator', attributionPercentage: 10, initials: 'DA' },
      { id: 'user_4', name: 'Fatou Diop', role: 'Reviewer', attributionPercentage: 20, initials: 'FD' }
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Phase 1: Field Recordings Collection',
        date: 'Jan 2024',
        status: 'Completed',
        tasks: [
          { id: 't1', title: 'Procure audio equipment', status: 'Completed', assigneeId: 'user_1' },
          { id: 't2', title: 'Travel to Gao', status: 'Completed', assigneeId: 'user_2' }
        ]
      },
      {
        id: 'm2',
        title: 'Phase 2: Transcription & Translation',
        date: 'Aug 2024',
        status: 'Active',
        tasks: [
          { id: 't3', title: 'Transcribe Songhai audio tapes', status: 'Completed', assigneeId: 'user_1' },
          { id: 't4', title: 'Translate transcripts to French', status: 'Claimed', assigneeId: 'user_123' },
          { id: 't5', title: 'Cross-reference with existing literature', status: 'Unassigned' }
        ]
      },
      {
        id: 'm3',
        title: 'Phase 3: Digital Archiving & Publication',
        date: 'Dec 2024',
        status: 'Pending',
        tasks: [
          { id: 't6', title: 'Format manuscripts for Studio', status: 'Unassigned' },
          { id: 't7', title: 'Anchor & Publish to Community Library', status: 'Unassigned' }
        ]
      }
    ],
    artifacts: [
      { id: 'a1', title: 'Songhai Lineage Translation Draft', status: 'Draft', updatedAt: '2 hours ago', authorIds: ['user_123', 'user_1'], content: '' },
      { id: 'a2', title: 'Field Recording Metadata Spec', status: 'Published', updatedAt: '3 weeks ago', authorIds: ['user_2'], content: '' }
    ],
    discussions: [
      { id: 'd1', authorId: 'user_1', authorName: 'Amina Diallo', content: 'The audio clarity from the second tape is poor. David, can you try to decipher the chants around the 14-minute mark?', timestamp: 'Yesterday' },
      { id: 'd2', authorId: 'user_123', authorName: 'David Adeleke', content: 'Looking into it now. It sounds like a dialect variation. I might need to consult the reference dictionary.', timestamp: '4 hours ago' }
    ],
    references: [
      { id: 'r1', title: 'Songhai Dictionary (1998)', url: '#', type: 'Document' },
      { id: 'r2', title: 'Gao Map Archives', url: '#', type: 'Archive' }
    ]
  }
};



const MOCK_REVISIONS: Record<string, DocumentRevision[]> = {
  'a1': [
    { id: 'rev_3', timestamp: '10 mins ago', authorName: 'David Adeleke', description: 'Updated translation of verse 3.' },
    { id: 'rev_2', timestamp: '2 hours ago', authorName: 'Amina Diallo', description: 'Added initial introductory context.' },
    { id: 'rev_1', timestamp: 'Yesterday', authorName: 'David Adeleke', description: 'Created initial draft structure.' }
  ]
};

const MOCK_ANALYTICS: Record<string, ArtifactAnalytics> = {
  'a2': {
    readershipQualityScore: 88,
    citations: 12,
    saves: 45,
    communityReuse: 3,
    supporterConversionRate: 4.2,
    contributionSpread: [
      { label: 'Scribes of Sahel', percentage: 70 },
      { label: 'Gao Historians', percentage: 20 },
      { label: 'Independent', percentage: 10 }
    ]
  }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export const useGetProjectDetails = (projectId: string) => {
  return useXQuery({
    queryKey: ['projectDetails', projectId],
    queryFn: async () => {
      await delay(500);
      return MOCK_PROJECT_DETAILS[projectId] || null;
    },
    enabled: !!projectId
  });
};



export const useGetDocumentRevisions = (artifactId: string) => {
  return useXQuery({
    queryKey: ['documentRevisions', artifactId],
    queryFn: async () => {
      await delay(300);
      return MOCK_REVISIONS[artifactId] || [];
    },
    enabled: !!artifactId
  });
};

export const useGetArtifactAnalytics = (artifactId: string) => {
  return useXQuery({
    queryKey: ['artifactAnalytics', artifactId],
    queryFn: async () => {
      await delay(400);
      // Return default analytics if not found
      return MOCK_ANALYTICS[artifactId] || {
        readershipQualityScore: 0,
        citations: 0,
        saves: 0,
        communityReuse: 0,
        supporterConversionRate: 0,
        contributionSpread: []
      };
    },
    enabled: !!artifactId
  });
};

export const useGetArtifactDetails = (artifactId: string) => {
  return useXQuery({
    queryKey: ['artifactDetails', artifactId],
    queryFn: async () => {
      await delay(500);
      for (const projectId in MOCK_PROJECT_DETAILS) {
        const project = MOCK_PROJECT_DETAILS[projectId];
        const artifact = project.artifacts.find(a => a.id === artifactId);
        if (artifact) {
          return {
            ...artifact,
            projectTitle: project.title,
            projectId: project.id,
            communityId: project.communityId,
            authors: artifact.authorIds.map(id => project.contributors.find(c => c.id === id)).filter(Boolean) as ProjectContributor[]
          };
        }
      }
      return null;
    },
    enabled: !!artifactId
  });
};

export const addMockProjectDetail = (project: ProjectDetail) => {
  MOCK_PROJECT_DETAILS[project.id] = project;
};

export const useCreateArtifact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, title, content }: { projectId: string, title: string, content?: string }) => {
      await delay(1000);
      const newId = `a_${Date.now()}`;
      
      const project = MOCK_PROJECT_DETAILS[projectId];
      if (project) {
        project.artifacts.push({
          id: newId,
          title,
          status: 'Draft',
          content: content || '',
          updatedAt: 'Just now',
          authorIds: ['user_123']
        });
      }
      
      return newId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', variables.projectId] });
    }
  });
};

export const useUpdateArtifact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, artifactId, updates }: { projectId: string, artifactId: string, updates: Partial<ProjectArtifact> }) => {
      await delay(1000);
      
      const project = MOCK_PROJECT_DETAILS[projectId];
      if (project) {
        const artifactIndex = project.artifacts.findIndex(a => a.id === artifactId);
        if (artifactIndex !== -1) {
          project.artifacts[artifactIndex] = {
            ...project.artifacts[artifactIndex],
            ...updates,
            updatedAt: 'Just now'
          };
        }
      }
      return artifactId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', variables.projectId] });
    }
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { communityId: string, title: string, description: string, targetDeadline: string }) => {
      await delay(1000);
      const newId = `p_${Date.now()}`;
      
      const newProjectDetail: ProjectDetail = {
        id: newId,
        communityId: data.communityId,
        title: data.title,
        description: data.description,
        progress: 0,
        status: 'Emerging',
        dateCreated: 'Just now',
        targetDeadline: data.targetDeadline,
        tags: [],
        contributors: [{ id: 'user_123', name: 'David Adeleke', role: 'Founder', attributionPercentage: 100, initials: 'DA' }],
        milestones: [],
        artifacts: [],
        discussions: [],
        references: []
      };
      
      addMockProjectDetail(newProjectDetail);
      
      addMockVillageProject({
        id: newId,
        title: data.title,
        description: data.description,
        progress: 0,
        contributors: 1
      });
      
      return newId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['villageProjects'] });
    }
  });
};

export const useGetUserArtifacts = () => {
  return useInfiniteQuery({
    queryKey: ['userArtifacts'],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      await delay(800); // Simulate network latency
      
      const ITEMS_PER_PAGE = 5;
      
      // Generate some dummy data
      const allArtifacts: ProjectArtifact[] = Array.from({ length: 24 }).map((_, i) => ({
        id: `user_art_${i}`,
        title: `Document Draft ${i + 1}`,
        status: i % 3 === 0 ? 'Published' : 'Draft',
        updatedAt: `${i + 1} hours ago`,
        authorIds: ['user_123'],
        content: `A contentful content ${i + 1}`
      }));

      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const data = allArtifacts.slice(start, end);
      
      return {
        data,
        nextPage: end < allArtifacts.length ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
