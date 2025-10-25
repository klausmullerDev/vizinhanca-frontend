import { StarRating } from '../Ui/StarRating';

type Avaliador = {
    name: string;
    avatar?: string;
};

type Avaliacao = {
    id: string;
    nota: number;
    comentario: string;
    avaliador: Avaliador;
};

type Reputacao = {
    mediaGeral: number;
    totalAvaliacoes: number;
    avaliacoesRecentes: Avaliacao[];
};

interface ReputacaoUsuarioProps {
    reputacao: Reputacao | null | undefined; 
    userName: string;
}

export const ReputacaoUsuario = ({ reputacao, userName }: ReputacaoUsuarioProps) => {
    if (!reputacao || reputacao.totalAvaliacoes === 0) {
        return (
            <div className="border-t border-slate-200 pt-5">
                <label className="text-sm font-semibold text-slate-600">Reputação</label>
                <p className="text-sm text-slate-500 mt-1">{userName} ainda não possui avaliações.</p>
            </div>
        );
    }

    const { mediaGeral, totalAvaliacoes, avaliacoesRecentes } = reputacao;

    return (
        <div className="border-t border-slate-200 pt-5 space-y-4">
            <div>
                <label className="text-sm font-semibold text-slate-600">Reputação Geral</label>
                <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={mediaGeral} />
                    <span className="text-sm text-slate-500 font-medium">
                        {mediaGeral.toFixed(1)} ({totalAvaliacoes} avaliações)
                    </span>
                </div>
            </div>

            {avaliacoesRecentes && avaliacoesRecentes.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Comentários Recentes</h4>
                    <ul className="space-y-3">
                        {avaliacoesRecentes.map(aval => (
                            <li key={aval.id} className="text-sm">
                                <p className="text-slate-700 bg-slate-50 p-2 rounded-md">"{aval.comentario}"</p>
                                <div className="flex items-center justify-end mt-1">
                                    <span className="text-xs text-slate-400"> - {aval.avaliador.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};